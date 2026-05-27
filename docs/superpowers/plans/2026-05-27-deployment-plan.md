# 中文名生成器订阅功能部署实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成中文名生成器项目从本地测试到生产环境上线的全流程部署，确保用户注册、订阅支付、名字生成等所有功能正常运行。

**Architecture:** 采用Vue3单页应用 + Vercel Edge Functions后端API + Supabase认证与数据库 + Stripe支付处理的全Serverless架构，无需额外服务器运维，自动扩展。

**Tech Stack:** Vue 3.4, Vite 5, Vercel Edge Functions, Supabase Auth/DB, Stripe API v2026-04-22

---

### Task 1: 本地依赖安装与功能测试

**Files:**
- Modify: `package.json` (已完成stripe依赖添加)
- Verify: `api/**/*.js` (Edge Functions代码)
- Verify: `src/**/*.vue` (前端功能代码)

- [ ] **Step 1: 安装项目依赖**

运行：
```bash
cd F:/IDEAWorkSpace/ai/demo1/chinese-name-generator
npm install
```
Expected: 所有依赖安装成功，无报错。

- [ ] **Step 2: 本地启动开发服务器**

运行：
```bash
npm run dev
```
Expected: 开发服务器启动成功，显示本地访问地址（如http://localhost:5173）。

- [ ] **Step 3: 本地功能测试**
  1. 访问本地地址，检查首页名字生成功能是否正常
  2. 访问/pricing页面，检查套餐展示是否正确
  3. 测试登录/注册功能是否正常（使用Supabase测试账号）
  4. 测试升级套餐按钮点击是否正常跳转（无需实际支付）

- [ ] **Step 4: 构建生产版本验证**

运行：
```bash
npm run build
```
Expected: 构建成功，dist目录生成正确的生产文件。

- [ ] **Step 5: 提交本地更改**

```bash
git add package.json vercel.json
git commit -m "feat: add stripe dependency and vercel config"
```

---

### Task 2: Supabase数据库Schema配置

**Files:**
- Reference: `supabase-schema.sql` (已存在)

- [ ] **Step 1: 登录Supabase控制台**
  访问https://app.supabase.com/，选择你的项目。

- [ ] **Step 2: 运行SQL脚本创建表结构**
  1. 进入SQL Editor → New Query
  2. 复制以下完整SQL脚本到编辑器：
```sql
-- 创建订阅表
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_type TEXT CHECK (plan_type IN ('free', 'pro', 'enterprise')) DEFAULT 'free',
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')) DEFAULT 'active',
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 启用行级安全 (RLS)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的订阅信息
CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 创建策略：只有服务角色可以更新订阅信息（webhook使用）
CREATE POLICY "Service role can update subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- 创建更新时间自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 可选：创建用户配置文件表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT,
  avatar_url TEXT
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 自动为新用户创建默认订阅记录的触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active');
  
  -- 如果使用profiles表，也可以在这里创建用户配置文件
  -- INSERT INTO public.profiles (id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 注册触发器，在用户创建时自动执行
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```
  3. 点击"Run"执行脚本
  Expected: 执行成功，无错误。

- [ ] **Step 3: 验证表创建成功**
  进入Table Editor，确认subscriptions表已创建，并且有正确的字段和RLS策略。

---

### Task 3: 代码推送到GitHub仓库

**Files:**
- Verify: `.gitignore` (确保忽略敏感文件)

- [ ] **Step 1: 检查.gitignore文件内容**
  确认包含以下内容：
```
node_modules
dist
.DS_Store
.env
.env.local
.env.*.local
```
  避免将敏感的.env文件提交到仓库。

- [ ] **Step 2: 检查当前git状态**

运行：
```bash
git status
```
Expected: 仅显示必要的代码文件，没有.env、node_modules等敏感或不必要的文件。

- [ ] **Step 3: 提交所有未提交的更改**

```bash
git add .
git commit -m "feat: complete subscription payment functionality"
```

- [ ] **Step 4: 推送到远程GitHub仓库**

```bash
git push origin main
```
Expected: 推送成功，所有代码同步到GitHub远程仓库。

---

### Task 4: Vercel项目导入与配置

**Files:**
- Reference: `vercel.json` (已创建)

- [ ] **Step 1: 登录Vercel控制台**
  访问https://vercel.com/，使用GitHub账号登录。

- [ ] **Step 2: 导入GitHub项目**
  1. 点击"Add New" → "Project"
  2. 在Import Git Repository中选择你的chinese-name-generator仓库
  3. 点击"Import"

- [ ] **Step 3: 配置项目部署选项**
  1. **Project Name**: 输入项目名称（如chinese-name-generator）
  2. **Framework Preset**: 选择"Vite"
  3. **Root Directory**: 保持默认（项目根目录）
  4. **Build Command**: 保持默认`npm run build`
  5. **Output Directory**: 保持默认`dist`

- [ ] **Step 4: 配置环境变量**
  在"Environment Variables"部分添加以下变量：
  ```
  # Supabase配置
  SUPABASE_URL=你的Supabase项目URL
  SUPABASE_SERVICE_ROLE_KEY=你的Supabase service role密钥
  VITE_SUPABASE_URL=你的Supabase项目URL
  VITE_SUPABASE_ANON_KEY=你的Supabase anon密钥
  
  # Stripe配置
  STRIPE_SECRET_KEY=你的Stripe Secret Key（测试模式）
  STRIPE_WEBHOOK_SECRET=暂时留空，后续配置webhook后填写
  VITE_STRIPE_PUBLISHABLE_KEY=你的Stripe Publishable Key（测试模式）
  VITE_STRIPE_PRICE_PRO_MONTHLY=Pro月度套餐Price ID（测试模式）
  VITE_STRIPE_PRICE_PRO_YEARLY=Pro年度套餐Price ID（测试模式）
  VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY=Enterprise月度套餐Price ID（测试模式）
  STRIPE_PRICE_PRO_MONTHLY=Pro月度套餐Price ID（测试模式）
  STRIPE_PRICE_PRO_YEARLY=Pro年度套餐Price ID（测试模式）
  STRIPE_PRICE_ENTERPRISE_MONTHLY=Enterprise月度套餐Price ID（测试模式）
  
  # 应用URL，部署后Vercel会分配，暂时先填占位符
  APP_URL=https://your-project-name.vercel.app
  ```
  > 注意：APP_URL暂时填你期望的Vercel域名，部署后如果不一致需要更新。

- [ ] **Step 5: 开始部署**
  点击"Deploy"按钮，等待部署完成。
  Expected: 部署成功，Vercel显示部署完成页面，并分配访问域名（如https://chinese-name-generator-xxx.vercel.app）。

- [ ] **Step 6: 验证部署成功**
  访问Vercel分配的域名，确认网站可以正常打开，首页功能正常。

---

### Task 5: Stripe Webhook配置

**Files:**
- Reference: `api/stripe-webhook.js` (已存在)

- [ ] **Step 1: 获取Webhook端点URL**
  部署完成后，你的webhook端点URL为：
  `https://[你的Vercel域名]/api/stripe-webhook`
  例如：`https://chinese-name-generator-xxx.vercel.app/api/stripe-webhook`

- [ ] **Step 2: 在Stripe中配置Webhook**
  1. 登录Stripe Dashboard，确保处于"Test mode"（右上角开关）
  2. 进入"Developers" → "Webhooks" → "Add endpoint"
  3. **Endpoint URL**: 填入上面的webhook URL
  4. **Select events to listen to**: 勾选以下事件：
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
  5. 点击"Add endpoint"保存

- [ ] **Step 3: 获取Webhook Signing Secret**
  创建完成后，在webhook详情页面找到"Signing secret"，点击"Reveal"获取密钥（格式：`whsec_xxxxxx`）。

- [ ] **Step 4: 更新Vercel环境变量**
  回到Vercel项目设置 → "Environment Variables"：
  1. 更新`STRIPE_WEBHOOK_SECRET`为刚才获取的signing secret
  2. 更新`APP_URL`为你的Vercel实际域名（如https://chinese-name-generator-xxx.vercel.app）
  3. 保存更改

- [ ] **Step 5: 重新部署项目**
  1. 进入Vercel项目的"Deployments"页面
  2. 点击最新部署右侧的三个点 → "Redeploy"
  3. 等待重新部署完成

---

### Task 6: 支付功能端到端测试

- [ ] **Step 1: 注册测试账号**
  1. 访问你的Vercel域名
  2. 点击"登录/注册"，使用测试邮箱注册一个新账号
  Expected: 注册成功，自动登录。

- [ ] **Step 2: 测试升级到Pro套餐**
  1. 访问/pricing页面
  2. 点击Pro套餐的"Upgrade to Pro"按钮
  Expected: 跳转到Stripe结账页面。

- [ ] **Step 3: 使用测试卡完成支付**
  在Stripe结账页面输入测试卡信息：
  - 卡号：`4242 4242 4242 4242`
  - 过期日期：任意未来日期（如`12/34`）
  - CVC：任意3位数字（如`123`）
  - 其他信息随意填写
  点击"Pay"完成支付。
  Expected: 支付成功，自动跳回网站的/payment-success页面。

- [ ] **Step 4: 验证订阅状态更新**
  1. 访问/account页面
  Expected: 显示当前套餐为Pro，订阅状态为Active，显示到期时间。
  2. 测试Pro功能是否可用（如无限次生成名字、高级功能等）

- [ ] **Step 5: 测试订阅管理功能**
  1. 在/account页面点击"Manage Subscription"按钮
  Expected: 跳转到Stripe客户门户，可以查看和管理订阅（取消、更改套餐等）。
  2. 测试取消订阅功能，取消后返回网站检查订阅状态是否更新为"Canceled"。

- [ ] **Step 6: 验证数据库记录**
  回到Supabase Table Editor，查看subscriptions表：
  Expected: 存在你的测试用户的订阅记录，plan_type为"pro"，stripe_customer_id和stripe_subscription_id已正确填充，status为"active"。

---

### Task 7: 生产环境上线配置

- [ ] **Step 1: 切换Stripe到生产模式**
  1. 在Stripe Dashboard右上角关闭"Test mode"开关，进入生产模式
  2. 进入"Products"页面，重新创建和测试模式相同的三个套餐（Pro月度、Pro年度、Enterprise月度）
  3. 获取生产模式下的三个Price ID
  4. 进入"Developers" → "API keys"，获取生产模式的Publishable Key和Secret Key

- [ ] **Step 2: 配置生产模式Webhook**
  1. 在Stripe生产模式下，进入"Developers" → "Webhooks" → "Add endpoint"
  2. Endpoint URL填入你的生产域名的webhook地址（如https://your-custom-domain.com/api/stripe-webhook）
  3. 选择同样的三个事件：`checkout.session.completed`、`customer.subscription.updated`、`customer.subscription.deleted`
  4. 保存后获取生产模式的Webhook Signing Secret

- [ ] **Step 3: 更新Vercel环境变量为生产模式**
  回到Vercel项目设置 → "Environment Variables"，更新以下变量为生产模式的值：
  ```
  STRIPE_SECRET_KEY=生产模式Stripe Secret Key
  STRIPE_WEBHOOK_SECRET=生产模式Webhook Signing Secret
  VITE_STRIPE_PUBLISHABLE_KEY=生产模式Stripe Publishable Key
  VITE_STRIPE_PRICE_PRO_MONTHLY=生产模式Pro月度套餐Price ID
  VITE_STRIPE_PRICE_PRO_YEARLY=生产模式Pro年度套餐Price ID
  VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY=生产模式Enterprise月度套餐Price ID
  STRIPE_PRICE_PRO_MONTHLY=生产模式Pro月度套餐Price ID
  STRIPE_PRICE_PRO_YEARLY=生产模式Pro年度套餐Price ID
  STRIPE_PRICE_ENTERPRISE_MONTHLY=生产模式Enterprise月度套餐Price ID
  APP_URL=你的生产域名（如https://your-custom-domain.com）
  ```

- [ ] **Step 4: 配置自定义域名（可选）**
  1. 在Vercel项目设置 → "Domains"中添加你的自定义域名
  2. 按照Vercel的指引配置DNS解析（将域名的CNAME指向cname.vercel-dns.com）
  3. 等待DNS解析生效，Vercel会自动为你配置SSL证书
  Expected: 自定义域名可以正常访问，显示安全锁标志。

- [ ] **Step 5: 配置Supabase认证重定向URL**
  1. 进入Supabase项目 → "Authentication" → "URL Configuration"
  2. 将你的生产自定义域名添加到"Site URL"和"Redirect URLs"中
  3. 保存更改

- [ ] **Step 6: 重新部署生产版本**
  在Vercel中重新部署项目，让新的环境变量生效。

---

### Task 8: 上线后验证与监控

- [ ] **Step 1: 生产环境功能全量测试**
  1. 使用真实邮箱注册账号
  2. 测试完整的订阅支付流程（使用真实银行卡支付1次，然后退款）
  3. 测试所有功能：名字生成、历史记录、Pro功能、账户管理等
  Expected: 所有功能正常运行。

- [ ] **Step 2: 配置监控**
  1. **Stripe Dashboard**: 配置支付失败提醒、订阅状态变更提醒
  2. **Supabase Dashboard**: 监控数据库使用情况、认证请求次数
  3. **Vercel Dashboard**: 监控函数执行日志、错误率、访问量
  4. 配置错误告警，当有5xx错误或webhook失败时及时通知。

- [ ] **Step 3: 提交上线版本**
```bash
git tag -a v1.0.0 -m "Initial production release with subscription functionality"
git push origin v1.0.0
```

# 中文名生成器订阅功能部署指南

## 前置准备
在开始部署前，你需要准备以下账号：
1. [GitHub](https://github.com/) - 代码托管
2. [Vercel](https://vercel.com/) - 前端和Edge Functions部署（免费额度足够）
3. [Supabase](https://supabase.com/) - 用户认证和数据库（免费额度足够）
4. [Stripe](https://stripe.com/) - 支付处理（按交易收费，无固定费用）

## 步骤1：配置Supabase

### 1.1 创建Supabase项目
1. 访问[Supabase Dashboard](https://app.supabase.com/)并创建新项目
2. 等待项目初始化完成（通常需要2-3分钟）

### 1.2 创建数据库表
1. 进入项目 → SQL Editor → New Query
2. 将`supabase-schema.sql`文件中的内容复制粘贴到编辑器
3. 点击"Run"执行SQL脚本，创建所需的表和策略

### 1.3 获取项目配置信息
进入项目 → Settings → API，获取以下信息：
- Project URL（即`VITE_SUPABASE_URL`）
- anon public API Key（即`VITE_SUPABASE_ANON_KEY`）
- service_role secret（后面Vercel环境变量需要）

## 步骤2：配置Stripe

### 2.1 创建Stripe账号
1. 注册/登录[Stripe Dashboard](https://dashboard.stripe.com/)
2. 确保你处于测试模式（Toggle "Test mode" 开关在右上角）

### 2.2 创建产品和价格
1. 进入 Products → Add product
2. 创建三个产品套餐：

**Pro月度套餐**
- 名称：Pro Monthly
- 价格：$4.99 USD
- 计费周期：每月重复
- 保存后获取Price ID（格式：`price_xxxxxx`）

**Pro年度套餐**
- 名称：Pro Yearly
- 价格：$29.99 USD
- 计费周期：每年重复
- 保存后获取Price ID

**Enterprise月度套餐**
- 名称：Enterprise
- 价格：$29.99 USD
- 计费周期：每月重复
- 保存后获取Price ID

### 2.3 获取Stripe API密钥
进入 Developers → API keys，获取：
- Publishable key（即`VITE_STRIPE_PUBLISHABLE_KEY`）
- Secret key（后面Vercel环境变量需要，格式：`sk_test_xxxxxx`）

### 2.4 配置Webhook
稍后部署到Vercel后再回来配置Webhook。

## 步骤3：配置项目环境变量

### 3.1 创建环境变量文件
1. 复制项目根目录下的`.env.example`为`.env`
2. 填入之前获取的配置信息：
```env
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase anon密钥
VITE_STRIPE_PUBLISHABLE_KEY=你的Stripe公钥
VITE_STRIPE_PRICE_PRO_MONTHLY=Pro月度套餐Price ID
VITE_STRIPE_PRICE_PRO_YEARLY=Pro年度套餐Price ID
VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY=Enterprise月度套餐Price ID
```

## 步骤4：部署到Vercel

### 4.1 推送代码到GitHub
1. 将你的代码推送到GitHub仓库（如果还没有的话）

### 4.2 导入项目到Vercel
1. 登录Vercel → Add New → Project
2. 导入你的GitHub仓库
3. 配置项目：
   - Framework Preset：选择`Vite`
   - Root Directory：保持默认（项目根目录）
   - Build Command：保持默认`npm run build`
   - Output Directory：保持默认`dist`

### 4.3 配置Vercel环境变量
在"Environment Variables"部分添加以下变量：
```env
# 从Supabase获取
SUPABASE_URL=你的Supabase项目URL
SUPABASE_SERVICE_ROLE_KEY=你的Supabase service_role密钥

# 从Stripe获取
STRIPE_SECRET_KEY=你的Stripe Secret Key
STRIPE_WEBHOOK_SECRET=先留空，后面配置webhook后再填
STRIPE_PRICE_PRO_MONTHLY=Pro月度套餐Price ID
STRIPE_PRICE_PRO_YEARLY=Pro年度套餐Price ID
STRIPE_PRICE_ENTERPRISE_MONTHLY=Enterprise月度套餐Price ID

# 你的应用URL，部署后Vercel会分配，如：https://your-app.vercel.app
APP_URL=你的应用URL
```

### 4.4 部署
点击"Deploy"按钮，等待部署完成。部署完成后，Vercel会分配一个域名，如`https://your-app.vercel.app`。

## 步骤5：配置Stripe Webhook

### 5.1 获取webhook端点URL
部署完成后，你的webhook端点URL是：
`https://your-app.vercel.app/api/stripe-webhook`

### 5.2 在Stripe中配置webhook
1. 进入Stripe Dashboard → Developers → Webhooks → Add endpoint
2. Endpoint URL：填入上面的webhook URL
3. 选择要监听的事件：
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. 点击"Add endpoint"保存

### 5.3 获取webhook签名密钥
创建完成后，在webhook详情页面找到"Signing secret"，点击"Reveal"获取密钥（格式：`whsec_xxxxxx`）

### 5.4 更新Vercel环境变量
回到Vercel项目设置 → Environment Variables，更新：
- `STRIPE_WEBHOOK_SECRET`=刚才获取的签名密钥

### 5.5 重新部署
需要重新部署一次让环境变量生效：
Vercel → Deployments → 点击最新部署右侧的三个点 → Redeploy

## 步骤6：测试支付流程

### 6.1 测试账号
使用Stripe测试卡进行支付测试：
- 卡号：`4242 4242 4242 4242`
- 过期日期：任意未来日期（如12/34）
- CVC：任意3位数字（如123）

### 6.2 测试场景
1. 访问你的应用，注册账号
2. 点击"Upgrade to Pro"，跳转到Stripe结账页面
3. 使用测试卡完成支付
4. 支付完成后跳回应用，检查订阅状态是否更新为Pro
5. 测试付费功能是否可以正常使用
6. 测试账户页面的"Manage Subscription"功能是否正常跳转到Stripe客户门户

## 步骤7：上线生产环境

### 7.1 切换Stripe到生产模式
1. 在Stripe Dashboard右上角关闭"Test mode"
2. 获取生产环境的Publishable Key和Secret Key
3. 重新创建生产环境的产品和价格，获取对应的Price ID
4. 更新所有环境变量中的Stripe相关配置为生产环境的值

### 7.2 配置自定义域名（可选）
1. 在Vercel项目设置 → Domains中添加你的自定义域名
2. 按照Vercel的指引配置DNS解析
3. Vercel会自动为你配置SSL证书

### 7.3 配置Supabase认证的重定向URL
1. 进入Supabase项目 → Authentication → URL Configuration
2. 将你的自定义域名添加到"Site URL"和"Redirect URLs"中

## 后续维护

### 监控
- Stripe Dashboard：监控支付和订阅情况
- Supabase Dashboard：监控用户增长和数据库使用情况
- Vercel Dashboard：监控应用性能和访问量

### 升级功能
后续可以添加的增值功能：
1. AI名字深度分析（集成OpenAI API）
2. 书法字体生成
3. 名字含义语音讲解
4. 批量名字生成
5. API接口服务

## 故障排除

### 支付失败
1. 检查Stripe webhook是否配置正确
2. 检查Vercel环境变量是否正确配置
3. 查看Vercel函数日志排查错误

### 订阅状态不更新
1. 检查Stripe webhook事件是否成功发送
2. 检查Supabase数据库中的subscriptions表是否有对应记录
3. 检查RLS策略是否配置正确

### 用户登录问题
1. 检查Supabase认证配置是否正确
2. 检查重定向URL是否在Supabase白名单中
3. 检查CORS配置是否正确

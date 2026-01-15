# 🚀 Anker Partner App 原型更新指南

**版本**: V2.0
**更新日期**: 2026-01-15
**基于**: FP 文档 V2.0 (包含版本 1.8.0 和 1.9.0 需求)

---

## 📦 更新内容

本次更新使原型与最新优化的 FP 文档完全对齐,包含以下核心功能:

### ✨ 新增功能

1. **设备状态筛选** - 支持按 All/Online/Offline/Manual Offline/Low Battery Offline 筛选设备
2. **企业选择弹窗** - 多企业用户登录时可选择企业
3. **登录错误细化** - 区分账号不存在/密码错误/权限不足等错误
4. **用户账号保留** - 设备登记成功后保留用户账号输入,便于连续登记
5. **扫码超时处理** - 扫码30秒超时后自动切换到手动输入
6. **边界情况处理** - 特殊字符过滤、提交限流、搜索长度限制、Token过期自动跳转

---

## 🛠️ 使用方法

### 方法一: 引入补丁文件 (推荐)

1. **在 `index.html` 的 `</body>` 标签前添加**:
   ```html
   <script src="patch-v2.0.js"></script>
   ```

2. **刷新页面,补丁将自动初始化**

3. **打开浏览器控制台,查看初始化日志**:
   ```
   🚀 Anker Partner App Patch V2.0 loaded
   ✅ Patch V2.0 initialized successfully
   ```

### 方法二: 直接集成代码

如果需要完全集成到 `index.html`:

1. 打开 `patch-v2.0.js`
2. 复制所有代码
3. 粘贴到 `index.html` 的 `<script>` 标签中(在 `</body>` 前)

---

## 📋 功能使用说明

### 1. 设备状态筛选

**位置**: 设备管理页面
**使用**:
```html
<!-- 在设备列表上方会自动插入筛选chips -->
<div class="filter-chips-container">
  <button class="filter-chip active" onclick="filterDevicesByStatus('all')">All</button>
  <button class="filter-chip" onclick="filterDevicesByStatus('online')">Online</button>
  <button class="filter-chip" onclick="filterDevicesByStatus('offline')">Offline</button>
  ...
</div>
```

**JavaScript API**:
```javascript
// 手动触发筛选
filterDevicesByStatus('online'); // 筛选在线设备
filterDevicesByStatus('all');    // 显示所有设备
```

**注意**: 设备卡片需要添加 `data-status` 属性:
```html
<div class="device-card" data-status="online">...</div>
<div class="device-card" data-status="offline">...</div>
```

---

### 2. 企业选择弹窗

**位置**: 登录成功后
**使用**:
```javascript
// 模拟多企业登录场景
const companies = [
  { id: 'comp_001', name: 'Anker Innovations' },
  { id: 'comp_002', name: 'eufy Security' },
  { id: 'comp_003', name: 'Soundcore' }
];

// 显示企业选择弹窗
showCompanySelection(companies);

// 用户选择后,企业ID会存储到 localStorage
const selectedCompanyId = localStorage.getItem('selectedCompanyId');
```

---

### 3. 登录错误细化

**位置**: 登录页面
**使用**:
```javascript
// 根据后端返回的错误类型调用
handleLoginError('account_not_exist');     // "Account does not exist..."
handleLoginError('password_incorrect');    // "Incorrect password..."
handleLoginError('business_type_invalid'); // "Business Type is not Installer..."
handleLoginError('network_error');         // "Network error..."
```

**错误类型对照表**:
| 错误类型 | 显示提示 |
|---------|---------|
| `account_not_exist` | Account does not exist, please check your email |
| `password_incorrect` | Incorrect password, please try again |
| `business_type_invalid` | Business Type is not Installer, please contact admin... |
| `app_permission_disabled` | App Permission is disabled, please contact admin |
| `network_error` | Network error, please check your connection and retry |
| `timeout` | Request timeout, please retry |

---

### 4. 用户账号保留

**位置**: 设备登记页面
**使用**:
```javascript
// 设备登记成功后调用
handleDeviceRegisterSuccess('ABC123456789');

// 结果:
// ✅ Device SN输入框被清空
// ✅ 用户账号输入框保留内容 (不清空)
// ✅ 聚焦到SN输入框,方便连续登记
```

---

### 5. 扫码超时处理

**位置**: 扫码页面
**使用**:
```javascript
// 启动带超时的扫码
startQRScannerWithTimeout();

// 30秒后如果未扫码成功:
// ✅ 自动停止扫码
// ✅ 显示提示: "Scan timeout, please enter Device SN manually"
// ✅ 自动聚焦到手动输入框
```

---

### 6. 边界情况处理

#### 6.1 Device SN 特殊字符过滤
```javascript
// 自动移除特殊字符
const cleanedSN = validateDeviceSN('ABC-123@456#789');
// 返回: "ABC-123456789" (仅保留字母、数字、-_.符号)
```

#### 6.2 连续提交限流
```javascript
// 检查是否可以提交
if (checkSubmitCooldown()) {
  // 可以提交
  submitDeviceRegistration();
} else {
  // 显示冷却提示: "Please wait Xs before submitting again"
}
```

#### 6.3 搜索关键词长度限制
```javascript
// 自动限制搜索关键词长度
const searchInput = document.querySelector('[data-device-search]');
searchInput.addEventListener('input', function() {
  limitSearchKeyword(this); // 自动限制到100字符
});
```

#### 6.4 Token 过期自动处理
```javascript
// 当API返回401时自动触发
handleTokenExpired();

// 结果:
// ✅ 清除本地存储
// ✅ 显示提示: "Session expired, please login again"
// ✅ 2秒后自动跳转到登录页
```

#### 6.5 邮箱格式验证
```javascript
// 验证用户账号邮箱格式
if (validateUserEmail('user@example.com')) {
  // 格式正确,继续处理
} else {
  // 显示提示: "Please enter a valid email address"
}
```

---

## 🎨 设计规范

所有更新严格遵循 **eufy v0.6 设计规范**:

- **品牌色**: `#005D8E` (蓝色)
- **字体**: MontForAnker
- **圆角**: 使用 CSS 变量 `var(--comp-card-radius)`
- **间距**: 使用 `var(--ref-padding-*)`
- **动画**: 150ms 过渡效果

---

## 🔍 调试与测试

### 查看补丁版本
```javascript
console.log(window.ANKER_PARTNER_PATCH_VERSION); // "2.0.0"
console.log(window.ANKER_PARTNER_PATCH_DATE);    // "2026-01-15"
```

### 测试设备筛选
```javascript
// 打开浏览器控制台
filterDevicesByStatus('online');  // 应该只显示在线设备
filterDevicesByStatus('offline'); // 应该只显示离线设备
filterDevicesByStatus('all');     // 应该显示所有设备
```

### 测试企业选择
```javascript
// 打开浏览器控制台
showCompanySelection([
  { id: '1', name: 'Test Company A' },
  { id: '2', name: 'Test Company B' }
]);
// 应该弹出企业选择对话框
```

### 测试登录错误
```javascript
// 打开浏览器控制台
handleLoginError('business_type_invalid');
// 应该显示: "Business Type is not Installer..."
```

---

## 📊 测试检查清单

使用以下清单验证所有功能:

- [ ] **设备状态筛选**
  - [ ] 点击 "All" 显示所有设备
  - [ ] 点击 "Online" 仅显示在线设备
  - [ ] 点击 "Offline" 仅显示离线设备
  - [ ] 选中的chip高亮显示 (蓝色背景)
  - [ ] 空状态正确显示

- [ ] **登录错误提示**
  - [ ] 账号不存在时显示正确提示
  - [ ] 密码错误时显示正确提示
  - [ ] Business Type不符合时显示正确提示
  - [ ] 网络错误时显示正确提示

- [ ] **用户账号保留**
  - [ ] 设备登记成功后用户账号输入框不清空
  - [ ] Device SN输入框被清空
  - [ ] 聚焦到SN输入框

- [ ] **企业选择弹窗**
  - [ ] 多企业用户登录时显示弹窗
  - [ ] 可以选择不同的企业
  - [ ] 选中的企业有视觉反馈
  - [ ] 确认后企业ID存储到localStorage

- [ ] **扫码超时**
  - [ ] 启动扫码后30秒未成功则自动停止
  - [ ] 显示超时提示
  - [ ] 自动切换到手动输入

- [ ] **边界情况**
  - [ ] Device SN输入特殊字符自动过滤
  - [ ] 连续提交被限流(3秒冷却)
  - [ ] 搜索关键词超过100字符自动截断
  - [ ] Token过期自动跳转登录
  - [ ] 邮箱格式错误显示提示

---

## 🐛 故障排查

### 问题: 补丁未生效

**解决方案**:
1. 检查 `patch-v2.0.js` 是否正确引入
2. 打开浏览器控制台,查看是否有错误
3. 确认看到初始化日志: `✅ Patch V2.0 initialized successfully`

### 问题: 设备筛选不工作

**解决方案**:
1. 确认设备卡片有 `data-status` 属性
2. 检查 `.device-card` 类名是否正确
3. 打开控制台,手动调用 `filterDevicesByStatus('online')` 测试

### 问题: 企业选择弹窗不显示

**解决方案**:
1. 确认调用了 `showCompanySelection(companies)`
2. 检查 `companies` 数组格式是否正确
3. 查看浏览器控制台是否有错误

---

## 📝 后续计划

### 版本 1.9.0 功能集成 (待开发)

1. **订阅管理模块**
   - 订阅列表查看
   - 订阅详情
   - 订阅状态管理

2. **产品详情附件**
   - 附件上传
   - 附件预览
   - PDF查看器

3. **在线签名**
   - 手写签名
   - 签名保存
   - 合同签署

4. **高级筛选**
   - 多条件筛选
   - 日期范围筛选
   - 自定义排序

---

## 📞 支持

如有问题,请参考:
1. **FP 文档**: `/Users/anker/anker-partner/AnkOutput/anker-partner/fpgeneration/FeatureProposal.md`
2. **更新说明**: `UPDATES.md`
3. **补丁代码**: `patch-v2.0.js`

---

**文档版本**: V1.0
**最后更新**: 2026-01-15
**维护者**: AA01 - FP Generation PA

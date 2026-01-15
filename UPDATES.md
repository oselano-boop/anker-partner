# Anker Partner App 原型更新说明

**更新日期**: 2026-01-15
**基于**: FP 文档 V2.0 (版本 1.8.0 + 1.9.0)
**更新目标**: 使原型与优化后的 FP 文档完全对齐

---

## 📋 更新内容总览

### 1. 设备管理模块 - 新增状态筛选 ✅

**需求来源**: FP文档 V1.8.0 - 用户故事 1.8.0-06
**优先级**: P0
**更新位置**: 设备管理页面 (Device Management Tab)

**更新内容**:
- 在设备列表上方添加状态筛选chips组件
- 支持的筛选选项:
  - `All` (默认选中)
  - `Online`
  - `Offline`
  - `Manual Offline`
  - `Low Battery Offline`
- 点击筛选chip时,实时过滤设备列表
- 选中状态使用 eufy v0.6 的品牌色 (#005D8E)

**实现代码** (插入到设备列表前):
```html
<!-- Status Filter Chips -->
<div class="filter-chips-container">
  <button class="filter-chip active" data-status="all" onclick="filterDevicesByStatus('all')">All</button>
  <button class="filter-chip" data-status="online" onclick="filterDevicesByStatus('online')">Online</button>
  <button class="filter-chip" data-status="offline" onclick="filterDevicesByStatus('offline')">Offline</button>
  <button class="filter-chip" data-status="manual_offline" onclick="filterDevicesByStatus('manual_offline')">Manual Offline</button>
  <button class="filter-chip" data-status="low_battery" onclick="filterDevicesByStatus('low_battery')">Low Battery Offline</button>
</div>
```

**JavaScript函数**:
```javascript
function filterDevicesByStatus(status) {
  // Remove active class from all chips
  document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));

  // Add active class to clicked chip
  event.target.classList.add('active');

  // Filter device list
  const deviceCards = document.querySelectorAll('.device-card');
  deviceCards.forEach(card => {
    const deviceStatus = card.dataset.status;
    if (status === 'all' || deviceStatus === status) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });

  // Show empty state if no devices match
  const visibleDevices = document.querySelectorAll('.device-card[style*="display: block"]').length;
  const emptyState = document.querySelector('.device-empty-state');
  if (visibleDevices === 0 && emptyState) {
    emptyState.classList.remove('hidden');
  } else if (emptyState) {
    emptyState.classList.add('hidden');
  }
}
```

---

### 2. 登录模块 - 优化错误提示 ✅

**需求来源**: FP文档 V1.8.0 - 用户故事 1.8.0-01
**优先级**: P0
**更新位置**: 登录页面

**更新内容**:
- 细化登录失败的错误提示:
  - `账号不存在` - "Account does not exist, please check your email"
  - `密码错误` - "Incorrect password, please try again"
  - `Business Type不是Installer` - "Business Type is not Installer, please contact admin to update permissions"
- 使用 eufy dialog 样式显示错误

**实现代码**:
```javascript
function handleLoginError(errorType) {
  let title = 'Login Failed';
  let message = '';

  switch(errorType) {
    case 'account_not_exist':
      message = 'Account does not exist, please check your email';
      break;
    case 'password_incorrect':
      message = 'Incorrect password, please try again';
      break;
    case 'business_type_invalid':
      title = 'Access Denied';
      message = 'Business Type is not Installer, please contact admin to update permissions';
      break;
    case 'network_error':
      message = 'Network error, please check your connection and retry';
      break;
    default:
      message = 'Login failed, please try again';
  }

  showModal(title, message);
}
```

---

### 3. 设备登记 - 保留用户账号输入 ✅

**需求来源**: FP文档 V1.8.0 - 用户故事 1.8.0-03, AC2
**优先级**: P0
**更新位置**: 设备登记页面

**更新内容**:
- 用户账号填写一次后,提交设备后不清空
- 便于连续为同一用户登记多台设备
- 仅在切换Tab或退出登录时清空

**实现代码**:
```javascript
// 修改设备登记提交成功后的处理
function handleDeviceRegisterSuccess() {
  // 显示成功提示
  showToast('Device registered successfully', 'success');

  // 清空Device SN输入框
  document.getElementById('deviceSNInput').value = '';

  // ✅ 保留用户账号输入框的内容 (不清空)
  // document.getElementById('userAccountInput').value = ''; // 删除这行

  // 停留在登记页,允许继续登记下一台设备
  // (不跳转到其他页面)
}
```

---

### 4. 企业选择弹窗 - 多企业场景 ✅

**需求来源**: FP文档 V1.8.0 - 用户故事 1.8.0-01, AC3
**优先级**: P0
**更新位置**: 登录成功后

**更新内容**:
- 当用户账号关联多个企业且都有App权限时
- 登录成功后显示企业选择弹窗
- 用户选择企业后才进入主界面

**实现代码**:
```html
<!-- Company Selection Modal -->
<div id="companySelectionModal" class="modal-overlay hidden">
  <div class="modal-content">
    <div class="modal-body">
      <h3 class="modal-title">Select Company</h3>
      <p class="modal-description">Your account is associated with multiple companies. Please select one to continue.</p>

      <div id="companyOptions" style="display: flex; flex-direction: column; gap: var(--ref-padding-m); margin-top: var(--ref-padding-l);">
        <!-- Company options will be dynamically inserted here -->
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="confirmCompanySelection()">Confirm</button>
    </div>
  </div>
</div>
```

**JavaScript函数**:
```javascript
function showCompanySelection(companies) {
  const modal = document.getElementById('companySelectionModal');
  const optionsContainer = document.getElementById('companyOptions');

  // Clear previous options
  optionsContainer.innerHTML = '';

  // Create option cards
  companies.forEach((company, index) => {
    const option = document.createElement('div');
    option.className = 'company-option';
    option.dataset.companyId = company.id;
    if (index === 0) option.classList.add('selected');

    option.innerHTML = `
      <div class="company-option-radio"></div>
      <div class="company-option-label">${company.name}</div>
    `;

    option.onclick = () => selectCompany(option);
    optionsContainer.appendChild(option);
  });

  modal.classList.remove('hidden');
}

function selectCompany(optionElement) {
  // Remove selected from all options
  document.querySelectorAll('.company-option').forEach(opt => {
    opt.classList.remove('selected');
  });

  // Add selected to clicked option
  optionElement.classList.add('selected');
}

function confirmCompanySelection() {
  const selectedOption = document.querySelector('.company-option.selected');
  const companyId = selectedOption.dataset.companyId;

  // Store selected company ID
  localStorage.setItem('selectedCompanyId', companyId);

  // Hide modal and proceed to main app
  document.getElementById('companySelectionModal').classList.add('hidden');
  showMainApp();
}
```

---

### 5. 边界情况处理 - 增强提示 ✅

**需求来源**: FP文档优化 - 章节 4.4.5 边界条件与极端场景
**优先级**: P0-P1
**更新位置**: 全局

**更新内容**:

**5.1 设备SN特殊字符过滤**
```javascript
function validateDeviceSN(sn) {
  // 移除特殊字符,仅保留字母数字和常见符号(-_.)
  const cleanedSN = sn.replace(/[^a-zA-Z0-9\-_.]/g, '');

  if (cleanedSN !== sn) {
    showToast('Special characters have been removed from Device SN', 'warning');
  }

  return cleanedSN;
}
```

**5.2 连续提交限流**
```javascript
let lastSubmitTime = 0;
const SUBMIT_COOLDOWN = 3000; // 3秒冷却时间

function handleDeviceRegisterSubmit() {
  const now = Date.now();

  if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
    const remainingTime = Math.ceil((SUBMIT_COOLDOWN - (now - lastSubmitTime)) / 1000);
    showToast(`Please wait ${remainingTime}s before submitting again`, 'warning');
    return;
  }

  lastSubmitTime = now;
  // Proceed with submission...
}
```

**5.3 搜索关键词长度限制**
```javascript
function handleDeviceSearch(event) {
  let keyword = event.target.value;

  if (keyword.length > 100) {
    keyword = keyword.substring(0, 100);
    event.target.value = keyword;
    showToast('Search keyword limited to 100 characters', 'warning');
  }

  // Proceed with search...
}
```

**5.4 Token过期处理**
```javascript
function handleTokenExpired() {
  // Clear local storage
  localStorage.removeItem('authToken');
  localStorage.removeItem('selectedCompanyId');

  // Show notification
  showToast('Session expired, please login again', 'warning');

  // Redirect to login
  setTimeout(() => {
    showLogin();
  }, 2000);
}
```

**5.5 设备列表大数据量优化**
```javascript
// 实现虚拟滚动或分页加载
function loadDevicesWithPagination(page = 1, pageSize = 50) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  // Load devices in chunks
  const devicesChunk = allDevices.slice(start, end);
  renderDeviceList(devicesChunk);

  // Show "Load More" button if more devices exist
  if (end < allDevices.length) {
    showLoadMoreButton(page + 1);
  }
}
```

---

### 6. 扫码超时处理 ✅

**需求来源**: FP文档 - 章节 4.4.3 业务异常
**优先级**: P0
**更新位置**: 扫码登记页面

**更新内容**:
- 扫码超时(>30秒)后自动切换到手动输入模式
- 显示友好提示

**实现代码**:
```javascript
let scanTimeout;
const SCAN_TIMEOUT_DURATION = 30000; // 30秒

function startQRScanner() {
  // Start scanner...

  // Set timeout
  scanTimeout = setTimeout(() => {
    stopQRScanner();
    showToast('Scan timeout, switched to manual input mode', 'info');
    switchToManualInput();
  }, SCAN_TIMEOUT_DURATION);
}

function onScanSuccess(decodedText) {
  clearTimeout(scanTimeout);
  // Process scanned SN...
}

function switchToManualInput() {
  document.getElementById('scannerModal').classList.remove('active');
  document.getElementById('deviceSNInput').focus();
}
```

---

## 📊 更新优先级

| 优先级 | 更新内容 | 状态 |
|--------|---------|------|
| P0 | 设备管理 - 状态筛选 | ✅ 完成 |
| P0 | 登录 - 错误提示细化 | ✅ 完成 |
| P0 | 设备登记 - 保留用户账号 | ✅ 完成 |
| P0 | 企业选择弹窗 | ✅ 完成 |
| P0 | 扫码超时处理 | ✅ 完成 |
| P0-P1 | 边界情况处理 | ✅ 完成 |

---

## 🎨 设计规范遵循

所有更新严格遵循 **eufy v0.6 设计规范**:
- **品牌色**: #005D8E (蓝色)
- **字体**: MontForAnker
- **组件样式**: 使用现有的 eufy v0.6 组件类名
- **交互反馈**: 150ms 过渡动画
- **圆角**: 使用设计系统定义的圆角值

---

## 📝 测试检查清单

- [ ] 设备列表状态筛选功能正常
- [ ] 筛选后的设备数量正确
- [ ] 登录失败时显示正确的错误提示
- [ ] 设备登记成功后用户账号保留
- [ ] 多企业用户登录时显示企业选择弹窗
- [ ] 企业选择后进入正确的企业上下文
- [ ] 扫码超时后自动切换到手动输入
- [ ] 设备SN特殊字符自动过滤
- [ ] 连续提交被正确限流
- [ ] Token过期后自动跳转登录页

---

## 🔄 后续优化建议

1. **版本 1.9.0 功能集成** (13个用户故事)
   - 订阅管理模块
   - 产品详情附件上传
   - PDF查看器集成
   - 在线签名功能
   - 高级筛选和排序

2. **性能优化**
   - 实现虚拟滚动 (设备数量>100时)
   - 图片懒加载
   - API请求防抖

3. **可访问性增强**
   - ARIA标签完善
   - 键盘导航支持
   - 屏幕阅读器优化

---

**更新者**: AA01 - FP Generation PA
**文档版本**: V1.0
**最后更新**: 2026-01-15

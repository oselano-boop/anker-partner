/**
 * Anker Partner App - 原型补丁 V2.0
 * 基于 FP 文档 V2.0 (版本 1.8.0 + 1.9.0)
 * 更新日期: 2026-01-15
 *
 * 使用方法:
 * 1. 在 index.html 的 </body> 前添加: <script src="patch-v2.0.js"></script>
 * 2. 或将以下代码直接复制到 index.html 的 <script> 标签中
 */

(function() {
  'use strict';

  console.log('🚀 Anker Partner App Patch V2.0 loaded');

  // ============================================
  // 1. 设备状态筛选功能
  // ============================================

  /**
   * 按状态筛选设备列表
   * @param {string} status - 筛选状态: 'all', 'online', 'offline', 'manual_offline', 'low_battery'
   */
  window.filterDevicesByStatus = function(status) {
    console.log('🔍 Filtering devices by status:', status);

    // 移除所有chip的active状态
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.classList.remove('active');
    });

    // 添加active到当前点击的chip
    const clickedChip = document.querySelector(`[data-status="${status}"]`);
    if (clickedChip) {
      clickedChip.classList.add('active');
    }

    // 筛选设备卡片
    const deviceCards = document.querySelectorAll('.device-card');
    let visibleCount = 0;

    deviceCards.forEach(card => {
      const deviceStatus = card.dataset.status || 'online';

      if (status === 'all' || deviceStatus === status) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // 显示/隐藏空状态
    const emptyState = document.querySelector('.device-empty-state');
    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.classList.remove('hidden');
        emptyState.querySelector('.empty-state-title').textContent = 'No Devices Found';
        emptyState.querySelector('.empty-state-description').textContent = `No devices with status "${status}" in current filter`;
      } else {
        emptyState.classList.add('hidden');
      }
    }

    console.log(`✅ Filtered ${visibleCount} devices`);
  };

  /**
   * 初始化状态筛选chips
   */
  function initializeStatusFilter() {
    // 检查是否已存在筛选组件
    if (document.querySelector('.filter-chips-container')) {
      console.log('✅ Status filter already exists');
      return;
    }

    // 查找设备列表容器
    const deviceListContainer = document.querySelector('[data-device-list]');
    if (!deviceListContainer) {
      console.warn('⚠️ Device list container not found');
      return;
    }

    // 创建筛选chips容器
    const filterChipsHTML = `
      <div class="filter-chips-container">
        <button class="filter-chip active" data-status="all" onclick="filterDevicesByStatus('all')">All</button>
        <button class="filter-chip" data-status="online" onclick="filterDevicesByStatus('online')">Online</button>
        <button class="filter-chip" data-status="offline" onclick="filterDevicesByStatus('offline')">Offline</button>
        <button class="filter-chip" data-status="manual_offline" onclick="filterDevicesByStatus('manual_offline')">Manual Offline</button>
        <button class="filter-chip" data-status="low_battery" onclick="filterDevicesByStatus('low_battery')">Low Battery</button>
      </div>
    `;

    // 插入到设备列表前
    deviceListContainer.insertAdjacentHTML('beforebegin', filterChipsHTML);
    console.log('✅ Status filter initialized');
  }

  // ============================================
  // 2. 登录错误提示优化
  // ============================================

  /**
   * 处理登录错误,显示细化的错误提示
   * @param {string} errorType - 错误类型
   */
  window.handleLoginError = function(errorType) {
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
      case 'app_permission_disabled':
        title = 'Access Denied';
        message = 'App Permission is disabled, please contact admin';
        break;
      case 'network_error':
        message = 'Network error, please check your connection and retry';
        break;
      case 'timeout':
        message = 'Request timeout, please retry';
        break;
      default:
        message = 'Login failed, please try again';
    }

    // 调用现有的showModal函数
    if (typeof showModal === 'function') {
      showModal(title, message);
    } else {
      alert(`${title}\n\n${message}`);
    }

    console.log(`❌ Login error: ${errorType}`);
  };

  // ============================================
  // 3. 设备登记 - 保留用户账号
  // ============================================

  /**
   * 设备登记成功处理(不清空用户账号)
   */
  window.handleDeviceRegisterSuccess = function(deviceSN) {
    console.log('✅ Device registered:', deviceSN);

    // 显示成功提示
    if (typeof showToast === 'function') {
      showToast('Device registered successfully', 'success');
    }

    // 清空Device SN输入框
    const snInput = document.getElementById('deviceSNInput');
    if (snInput) {
      snInput.value = '';
      snInput.focus(); // 聚焦到SN输入框,方便连续登记
    }

    // ✅ 关键更新: 不清空用户账号输入框
    // 保留用户账号,便于为同一用户连续登记多台设备
    const accountInput = document.getElementById('userAccountInput');
    if (accountInput) {
      console.log('✅ User account retained:', accountInput.value);
    }

    // 停留在登记页面,不跳转
  };

  // ============================================
  // 4. 企业选择功能
  // ============================================

  /**
   * 显示企业选择弹窗
   * @param {Array} companies - 企业列表 [{id: 'comp1', name: 'Company A'}, ...]
   */
  window.showCompanySelection = function(companies) {
    console.log('🏢 Showing company selection:', companies);

    let modal = document.getElementById('companySelectionModal');

    // 如果模态框不存在,创建它
    if (!modal) {
      const modalHTML = `
        <div id="companySelectionModal" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-body">
              <h3 class="modal-title">Select Company</h3>
              <p class="modal-description">Your account is associated with multiple companies. Please select one to continue.</p>
              <div id="companyOptions" style="display: flex; flex-direction: column; gap: var(--ref-padding-m); margin-top: var(--ref-padding-l);"></div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" onclick="confirmCompanySelection()">Confirm</button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      modal = document.getElementById('companySelectionModal');
    }

    const optionsContainer = document.getElementById('companyOptions');
    optionsContainer.innerHTML = '';

    // 创建企业选项
    companies.forEach((company, index) => {
      const option = document.createElement('div');
      option.className = 'company-option';
      option.dataset.companyId = company.id;
      if (index === 0) option.classList.add('selected');

      option.innerHTML = `
        <div class="company-option-radio"></div>
        <div class="company-option-label">${company.name}</div>
      `;

      option.onclick = function() {
        // 移除所有selected
        document.querySelectorAll('.company-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        // 添加selected到当前选项
        this.classList.add('selected');
      };

      optionsContainer.appendChild(option);
    });

    modal.classList.remove('hidden');
  };

  /**
   * 确认企业选择
   */
  window.confirmCompanySelection = function() {
    const selectedOption = document.querySelector('.company-option.selected');
    if (!selectedOption) {
      if (typeof showToast === 'function') {
        showToast('Please select a company', 'warning');
      }
      return;
    }

    const companyId = selectedOption.dataset.companyId;
    const companyName = selectedOption.querySelector('.company-option-label').textContent;

    console.log('✅ Company selected:', companyName, companyId);

    // 存储选择的企业
    localStorage.setItem('selectedCompanyId', companyId);
    localStorage.setItem('selectedCompanyName', companyName);

    // 隐藏模态框
    document.getElementById('companySelectionModal').classList.add('hidden');

    // 继续进入主应用
    if (typeof showMainApp === 'function') {
      showMainApp();
    }

    // 显示成功提示
    if (typeof showToast === 'function') {
      showToast(`Logged in as ${companyName}`, 'success');
    }
  };

  // ============================================
  // 5. 边界情况处理
  // ============================================

  /**
   * 验证并清理Device SN (移除特殊字符)
   * @param {string} sn - 原始SN
   * @returns {string} 清理后的SN
   */
  window.validateDeviceSN = function(sn) {
    const cleanedSN = sn.replace(/[^a-zA-Z0-9\-_.]/g, '');

    if (cleanedSN !== sn) {
      console.log('⚠️ Special characters removed from Device SN');
      if (typeof showToast === 'function') {
        showToast('Special characters have been removed', 'warning');
      }
    }

    return cleanedSN;
  };

  /**
   * 连续提交限流
   */
  let lastSubmitTime = 0;
  const SUBMIT_COOLDOWN = 3000; // 3秒

  window.checkSubmitCooldown = function() {
    const now = Date.now();

    if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
      const remainingTime = Math.ceil((SUBMIT_COOLDOWN - (now - lastSubmitTime)) / 1000);
      if (typeof showToast === 'function') {
        showToast(`Please wait ${remainingTime}s before submitting again`, 'warning');
      }
      return false;
    }

    lastSubmitTime = now;
    return true;
  };

  /**
   * 搜索关键词长度限制
   * @param {HTMLInputElement} inputElement - 搜索输入框
   */
  window.limitSearchKeyword = function(inputElement) {
    if (inputElement.value.length > 100) {
      inputElement.value = inputElement.value.substring(0, 100);
      if (typeof showToast === 'function') {
        showToast('Search keyword limited to 100 characters', 'warning');
      }
    }
  };

  /**
   * Token过期处理
   */
  window.handleTokenExpired = function() {
    console.log('⏰ Token expired');

    // 清除本地存储
    localStorage.removeItem('authToken');
    localStorage.removeItem('selectedCompanyId');
    localStorage.removeItem('selectedCompanyName');

    // 显示提示
    if (typeof showToast === 'function') {
      showToast('Session expired, please login again', 'warning');
    }

    // 跳转到登录页
    setTimeout(() => {
      if (typeof showLogin === 'function') {
        showLogin();
      } else {
        location.reload();
      }
    }, 2000);
  };

  /**
   * 用户账号格式验证
   * @param {string} email - 邮箱地址
   * @returns {boolean} 是否有效
   */
  window.validateUserEmail = function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    if (!isValid && typeof showToast === 'function') {
      showToast('Please enter a valid email address', 'error');
    }

    return isValid;
  };

  // ============================================
  // 6. 扫码超时处理
  // ============================================

  let scanTimeout;
  const SCAN_TIMEOUT_DURATION = 30000; // 30秒

  /**
   * 启动扫码并设置超时
   */
  window.startQRScannerWithTimeout = function() {
    console.log('📷 Starting QR scanner with 30s timeout');

    // 启动现有的扫码功能
    if (typeof startScanning === 'function') {
      startScanning();
    }

    // 设置超时
    scanTimeout = setTimeout(() => {
      console.log('⏰ Scan timeout, switching to manual input');

      // 停止扫码
      if (typeof stopScanning === 'function') {
        stopScanning();
      }

      // 显示提示
      if (typeof showToast === 'function') {
        showToast('Scan timeout, please enter Device SN manually', 'info');
      }

      // 切换到手动输入
      const snInput = document.getElementById('deviceSNInput');
      if (snInput) {
        snInput.focus();
      }
    }, SCAN_TIMEOUT_DURATION);
  };

  /**
   * 扫码成功处理
   * @param {string} decodedText - 扫码结果
   */
  window.onQRScanSuccess = function(decodedText) {
    // 清除超时
    if (scanTimeout) {
      clearTimeout(scanTimeout);
    }

    console.log('✅ QR scan success:', decodedText);

    // 清理SN
    const cleanedSN = validateDeviceSN(decodedText);

    // 填入输入框
    const snInput = document.getElementById('deviceSNInput');
    if (snInput) {
      snInput.value = cleanedSN;
    }

    // 停止扫码
    if (typeof stopScanning === 'function') {
      stopScanning();
    }
  };

  // ============================================
  // 7. 初始化补丁
  // ============================================

  function initializePatch() {
    console.log('🔧 Initializing patch V2.0...');

    // 在DOM加载完成后初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeStatusFilter, 1000);
      });
    } else {
      setTimeout(initializeStatusFilter, 1000);
    }

    // 监听设备SN输入框,自动清理特殊字符
    setTimeout(() => {
      const snInput = document.getElementById('deviceSNInput');
      if (snInput) {
        snInput.addEventListener('blur', function() {
          this.value = validateDeviceSN(this.value);
        });
        console.log('✅ Device SN input validation attached');
      }

      // 监听搜索输入框,限制长度
      const searchInput = document.querySelector('[data-device-search]');
      if (searchInput) {
        searchInput.addEventListener('input', function() {
          limitSearchKeyword(this);
        });
        console.log('✅ Search keyword limiter attached');
      }
    }, 1000);

    console.log('✅ Patch V2.0 initialized successfully');
  }

  // 立即初始化
  initializePatch();

  // ============================================
  // 8. API拦截器 (可选)
  // ============================================

  /**
   * 包装fetch,自动处理Token过期
   */
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args)
      .then(response => {
        // 检查401状态码
        if (response.status === 401) {
          handleTokenExpired();
        }
        return response;
      })
      .catch(error => {
        // 处理网络错误
        console.error('Network error:', error);
        if (typeof showToast === 'function') {
          showToast('Network error, please check your connection', 'error');
        }
        throw error;
      });
  };

  console.log('✅ API interceptor configured');

})();

// ============================================
// 导出补丁版本信息
// ============================================
window.ANKER_PARTNER_PATCH_VERSION = '2.0.0';
window.ANKER_PARTNER_PATCH_DATE = '2026-01-15';

console.log(`
╔════════════════════════════════════════╗
║  Anker Partner App Patch V2.0         ║
║  Based on FP Document V2.0            ║
║  Date: 2026-01-15                     ║
╚════════════════════════════════════════╝
`);

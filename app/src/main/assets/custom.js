import { appWindow, event } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/tauri';

console.log(
    '%cbuild from PakePlus： https://github.com/Sjj1024/PakePlus',
    'color:orangered;font-weight:bolder'
)

// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })

// 注册返回键事件监听
async function setupBackButtonHandler() {
  // 为 Android 平台注册返回键回调
  if (window.__TAURI__?.platform === 'android') {
    // 定义是否拦截返回键的逻辑
    window.__TAURI__.shouldInterceptBackPress = () => {
      // 示例：当导航栈不为空时拦截
      return document.querySelector('router-outlet')?.childElementCount > 0;
    };

    // 定义返回键处理函数
    window.__TAURI__.onBackPress = () => {
      // 执行返回操作，例如后退导航
      const router = document.querySelector('router-outlet');
      if (router && router.canGoBack()) {
        router.goBack();
      } else {
        // 无法后退时退出应用
        appWindow.close();
      }
    };

    // 监听来自 Rust 的返回键事件
    event.listen('android:back_press', async () => {
      // 执行自定义逻辑
      await invoke('handle_back_press', { window: appWindow });
    });
  }
}

// 应用初始化时调用
setupBackButtonHandler();

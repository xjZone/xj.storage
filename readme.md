<!-- --------------------------------------------------------------------------------------- -->
# xj.storage(本地存储操作)

**简介** : xj.storage 是一个关于本地存储操作的插件，它对 `localStorage` 和 `sessionStorage` 这两个对象的内容进行了一些扩展，使用该插件有以下好处，首先是它在操作时全程使用了 `try…catch` 容错处理，可避免存储操作出错后逻辑被卡住的危险，其次是它借助了 JSON 格式对数据进行了转存，使存储不再局限于字符串，最后是它修复了许多浏览器的 BUG，使得存储操作变得更加统一和安全。

**兼容** : IE10+ / Edge12+ / Firefox / Chrome / Safari / Opera / IOS Webkit / Android Platform

**更新** : <https://github.com/xjZone/xj.storage/blob/master/upgrade.md>

**文档** : <https://github.com/xjZone/xj.storage/>

**协议** : Apache 2.0

<!--◇
————

**推荐阅读 :**  
XJ.Chen - [localStorage 和 sessionStorage 的 20 个 BUG 与 8 个 Feature](https://juejin.cn/????)  
◇-->



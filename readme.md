<!-- --------------------------------------------------------------------------------------- -->
# xj.storage(本地存储操作)

**简介** : xj.storage 是一个关于本地存储的插件，它对 `localStorage` 和 `sessionStorage` 这两个对象的内容进行了一些扩展，使用该插件有以下好处，首先是它在操作时全程使用了 `try…catch` 容错处理，可避免存储操作出错后逻辑被卡住的危险，其次是它借助了 `JSON` 对数据格式进行了转存，使得存储不再局限于字符串，最后是它修复了许多浏览器的 BUG，使得存储操作变得更加统一和安全。

**兼容** : IE10+ / Edge12+ / Firefox / Chrome / Safari / Opera / IOS Webkit / Android Platform

**更新** : <https://github.com/xjZone/xj.storage/blob/master/upgrade.md>

**文档** : <https://xjZone.github.io/xj.storage/>

**协议** : [Apache License, V2.0](https://www.apache.org/licenses/LICENSE-2.0)

————

**推荐阅读 :**  
XJ.Chen - [漫谈 Web Storage API 既本地存储的 8 个 Features 和 20 个 BUG](https://juejin.cn/post/7149305844360806414)  



/** xj.storage(本地存储操作) | V0.2.1 | Apache Licence 2.0 | 2019-2021 © XJ.Chen | https://github.com/xjZone/xj.storage */
;(function(global, factory){
	if(typeof(define) === 'function' && (define.amd !== undefined || define.cmd !== undefined)){ define(factory) }
	else if(typeof(module) !== 'undefined' && typeof(exports) === 'object'){ module.exports = factory() }
	else{ global = (global||self), global.xj||(global.xj = {}), global.xj.storage = factory() };
}(this, function(){ 'use strict';



// ---------------------------------------------------------------------------------------------
// globalThis | window | self | global
var pub_global = (typeof(globalThis) !== 'undefined' ? globalThis : typeof(window) !== 'undefined' ? window : typeof(self) !== 'undefined' ? self : global);

// public nothing, version, keyword
var pub_nothing = function(){}, pub_version = '0.2.1', pub_keyword = 'storage';

// public config, advance set
var pub_config = {
	
	// 操作出错后是否要在 Console 面板输出错误，默认为 true，但这可能导致 Console 面板满屏飘红造成干扰，如果你不想输出错误浪费浏览器资源，可将参数改为 false
	consoleError : true,
	
	// 插件使用 JSON 格式转存数据，使得存储不再局限于字符串，但 JSON 格式无法存储 symbol 和 function，它们都会变成 undefined，JSON 解析 undefined 时将会出错
	// 该参数为 true 时，插件会自动将 symbol, function, undefined 转为 null，但它们在数组或对象中则不会被处理，在数组中总会转为 null，在对象中则会被自动抛弃
	undefined2null : true,
	
	// 按照标准 Storage 事件不应该在操作数据的页面被响应，只有同源的其他页面才能响应这个事件，这是因为在操作数据的页面响应容易出 BUG，但有些浏览器没遵循标准
	// IE 和 Safari(MacOS) 会操作数据的页面也触发事件，其实在当前页面响应有时也会很方便，所以插件提供了该参数，用于控制是否在操作数据的页面响应，默认为 true
	// 如果你还是希望标准化，Storage 事件不要在操作数据的页面被响应，可将该参数设置为 false，此时 IE 和 Safari(MacOS) 在操作数据的那个页面也就不会响应事件了
	dispatchOriginal : true,
	
};

// public option(00 items)
var pub_option = {};



// ---------------------------------------------------------------------------------------------
// 如果已经存在了就直接返回目标对象
if(pub_global.xj === undefined){ pub_global.xj = {} };
if(pub_global.xj.storageReturn === undefined){ pub_global.xj.storageReturn = {} };
if(pub_global.xj.storageReturn[pub_version] !== undefined){ return pub_global.xj.storageReturn[pub_version] };



// 创建并合并 config 和 option 参数
if(pub_global.xj.storageConfig === undefined){ pub_global.xj.storageConfig = {} };
if(pub_global.xj.storageOption === undefined){ pub_global.xj.storageOption = {} };
if(pub_global.xj.storageConfig[pub_version] !== undefined){ Object.keys(pub_global.xj.storageConfig[pub_version]).forEach(function(key){ pub_config[key] = pub_global.xj.storageConfig[pub_version][key] }) };
if(pub_global.xj.storageOption[pub_version] !== undefined){ Object.keys(pub_global.xj.storageOption[pub_version]).forEach(function(key){ pub_option[key] = pub_global.xj.storageOption[pub_version][key] }) };



// 创建页面最顶层四个全局节点的变量
var pub_win = pub_global;
var pub_doc = pub_win.document;
var pub_html = pub_doc.documentElement;
var pub_body = pub_doc.body;



// window 对象上的两个 Storage 实例
var pub_lStorage = pub_win.localStorage;
var pub_sStorage = pub_win.sessionStorage;

// 在 returnObject 上的两个对象合集
var pub_lsReturn = { listener : [], };
var pub_ssReturn = { listener : [], };



// forEach 循环辨别操作两个存储对象
var pub_typeList = ['ls', 'ss'];

// 用于检查数据是否是这个插件设置的
var pub_id_check = /xj_storage_t\d{13,}_r\d{13,}/;

// 当前页的标记，用于判断事件的起源
var pub_id = 'xj_storage_t' + Date.now() +'_r' + (
Math.random() +''+ String(Math.random())).replace(/0\./g, '').slice(0,13);



// ---------------------------------------------------------------------------------------------
// 该方法用于手动触发 Storage 事件，不需要再检测 support，因为在使用该方法的函数中都已经检测过了
// 创建 Storage 事件对象可以参考 : https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent
var dispatchStorage = function(key, oldValue, newValue, theStorage){
	
	// 如果不在本页触发则返回，否则创建事件对象
	if(pub_config.dispatchOriginal === false){ return };
	var targetEvent = pub_doc.createEvent('StorageEvent');
	
	// 虽然 initStorageEvent 不被推荐使用但可行
	targetEvent.initStorageEvent('storage', false, false, key, 
	oldValue, newValue, location.href, theStorage); 
	pub_win.dispatchEvent(targetEvent);
	
};



// 在存储操作后如果捕获到错误，就赋值在返回值对象的 error 属性上，如果全局配置允许输出错误就输出
// 参数 type 和 error 是类型和错误，type 用于判断是 localStorage 或 sessionStorage，错误用于赋值
var consoleError = function(type, error){
	
	// 根据 type 关键词设置 ls 和 ss 两组的变量
	var theReturn = (type === 'ls') ? pub_lsReturn : pub_ssReturn;
	var theStorage = (type === 'ls') ? pub_lStorage : pub_sStorage;
	
	// 更新 return 对象中的 error，根据条件输出
	theReturn.error = error;
	if(pub_config.consoleError === true
	&& pub_win.console !== undefined){ console.error(error) };
	
};



// Safari(iOS6-) 使用隐身模式时，localStorage 对象和 sessionStorage 对象都存在，但存储配额总为 0
// 操作触发 QUOTA_EXCEEDED_ERR 错误，得用 try…catch 容错 : https://stackoverflow.com/a/15436953
pub_typeList.forEach(function(type){
	
	// 根据 type 关键词设置 ls 和 ss 两组的变量
	var theReturn = (type === 'ls') ? pub_lsReturn : pub_ssReturn;
	var theStorage = (type === 'ls') ? pub_lStorage : pub_sStorage;
	
	// 尝试设置和获取键值对，不会出错就是支持的
	try{
		theReturn.error = null, theReturn.support = true;
		theStorage.setItem('xj-storage-test-key', '1');
		theStorage.removeItem('xj-storage-test-key');
	}catch(error){
		theReturn.support = false;
		consoleError(type, error);
	};
	
});



// ---------------------------------------------------------------------------------------------
// 跟上面检测 localStorage & sessionStorage 对象是否被支持的做法相同，也是遍历 pub_typeList 数组
// 使用 the 关键词代替 ls 和 ss 前缀来创建 return 返回值对象的内容，毕竟两个对象的方法都是一样的
pub_typeList.forEach(function(type){
var theReturn = pub_lsReturn, theStorage = pub_lStorage;
if(type === 'ss'){ theReturn = pub_ssReturn, theStorage = pub_sStorage };



// 获取数量，既 Storage 对象上总共存储了多少个键值对，如果当前浏览器并不支持目标对象，那就返回 0
// 在 try 中执行 return，可以会造成一些奇怪结果，所以创建变量 result，等 try…catch 执行完再返回
theReturn.length = function(){
	var result = 0;
	if(theReturn.support === false){ return result };
	try{ result = theStorage.length }catch(error){ consoleError(type, error) };
	return result;
};



// 获取键名，传入索引值获取目标的键名，取消了没传参数返回数组合集的操作，不存在或出错时返回 null
// 需要获取所有 key 值合集，可用 for(var i=0, l=xjls.length(); i<l; i++){ a.push(xjls.key(i)) };
theReturn.key = function(index){
	var result = null;
	if(theReturn.support === false){ return result };
	try{ result = theStorage.key(index) }catch(error){ consoleError(type, error) };
	return result;
};



// 获取内容，如果没找到目标键值对，或者函数出错了，就返回第 2 个参数既 defaultValue，默认为 null
// 取得结果后尝试 JSON.parse()，是插件设置的数据格式则获取 data 属性，不是插件设置的值就直接返回
theReturn.get = function(key, defaultValue){
	
	// 没传参数或不支持返回 defaultValue 默认值
	var result = null;
	if(arguments.length === 1){ defaultValue = null };
	if(arguments.length === 0 || theReturn.support === false){ return defaultValue };
	
	// 结果为 null 时返回默认值，否则就尝试解析
	try{
		result = theStorage.getItem(key);
		if(result === null){ result = defaultValue }else 
		if(pub_id_check.test(result) === true){ result = JSON.parse( result ).data };
	}catch(error){
		result = defaultValue;
		consoleError(type, error);
	};
	
	// 即使目标键值对不是插件设置的也可顺利获取
	return result;
	
};



// 设置内容，IE 和 SF(MacOS) 会在操作数据的页面也触发 Storage 事件，所以改造数据结构用 id 来规避
// 数据结构为 {id:xj_storage_t13_r13, act:'new', data:data}，有 create set remove clear 四种操作 
theReturn.set = function(key, value){
	
	// 不支持或没传参数则返回，否则创建相关变量
	if(theReturn.support === false || arguments.length !== 2){ return };
	var oldValueObject = null, oldValue = null; 
	var newValueObject = null;
	var operate = '';
	try{
		
		// 获取旧值，不被支持的值转为 null 类型
		oldValue = theStorage.getItem( key );
		if(pub_config.undefined2null === true 
		&& (typeof(value) === 'symbol' || typeof(value) 
		=== 'function' || value === undefined)){ value = null };
		
		// oldValue 为 null，或非插件设置的情况
		if(oldValue === null && pub_id_check.test(oldValue) === false){
			
			// 为 null 是新建，合成数据进行设置
			if(oldValue === null){ operate = 'create' }else{ operate = 'set' };
			newValueObject = {id : pub_id, act : operate, data : value};
			newValueObject = JSON.stringify(newValueObject);
			theStorage.setItem(key, newValueObject);
			
			// 手动的为当前页执行 Storage Event
			dispatchStorage(key, oldValue, newValueObject, theStorage);
			
		}
		
		// 如果旧值是插件生成的，需要比对新旧值
		else{
			
			// 只有在新旧值不相等的情况下才继续
			oldValueObject = JSON.parse(oldValue);
			if( JSON.stringify(value) !== 
			JSON.stringify(oldValueObject.data) ){
				
				// 合成数据进行设置，这回是 set
				newValueObject = {id : pub_id, act : 'set', data : value};
				newValueObject = JSON.stringify(newValueObject);
				theStorage.setItem(key, newValueObject);
				
				// 为当前页面执行 Storage Event
				dispatchStorage(key, oldValue, newValueObject, theStorage);
				
			};
		};
		
	}catch(error){ consoleError(type, error) };
	
};



// 移除内容，为了避免无意义的重复操作，所以一旦判断到要移除的目标 key 并不存在，就不再继续执行了
// 移除操作无法在 newValue 属性中附带数据，id 无法被传递，所以改为先执行 set，之后再进行移除操作
theReturn.remove = function(key){
	
	// 不支持或没传参数则返回，否则创建相关变量
	if(theReturn.support === false || arguments.length === 0){ return };
	var oldValue = null, newValueObject = null;
	try{
		
		// 被移除的目标必须要存在才能进入下一步
		oldValue = theStorage.getItem(key);
		if(oldValue !== null){
			
			// 使用代理操作以便记录操作的来源页
			newValueObject = {id : pub_id, act : 'remove', data : null};
			newValueObject = JSON.stringify(newValueObject);
			theStorage.setItem(key, newValueObject);
			
			// 手动的为当前页执行 Storage Event
			dispatchStorage(key, oldValue, newValueObject, theStorage);
			
			// 移除操作和执行事件的顺序不能调换
			theStorage.removeItem(key);
			
		};
		
	}catch(error){ consoleError(type, error) };
	
};



// 清空存储，为了避免无意义的重复操作，所以一旦判断到 length 属性为 0 既没数据，就不再继续执行了
// 清空操作无法在 newValue 属性中附带数据，id 无法被传递，所以改为先执行 set，之后再进行移除操作
theReturn.clear = function(){
	
	// 如果存储对象是不被支持的，那么就直接返回
	if(theReturn.support === false){ return };
	var newValueObject = null;
	try{
		
		// 必须要还有键值对的时候才能继续下一步
		if(theStorage.length !== 0){
			
			// 使用代理操作以便记录操作的来源页
			newValueObject = {id : pub_id, act : 'clear', data : null};
			newValueObject = JSON.stringify(newValueObject);
			theStorage.setItem('xj-storage-clear-key', newValueObject);
			
			// 手动的为当前页执行 Storage Event
			dispatchStorage('xj-storage-clear-key', 
			null, newValueObject, theStorage);
			
			// 清空操作和执行事件的顺序不能调换
			theStorage.clear();
			
		};
		
	}catch(error){ consoleError(type, error) };
	
};



// 计算空间，获取由 key 组成的数组，获取由 value 组成的数组，计算数组元素字符串 length，进行累加
// 由于 value 值往往会被 JSON 格式化，加上还可能存在四字节字符，所以实际上数据往往会比想象中更大
theReturn.byte = function(){
	
	// 如果存储对象是不被支持的，那么就直接返回
	if(theReturn.support === false){ return result };
	var result = 0, index = 0, length = 0;
	var key = '', value = '';
	
	// 遍历存储对象，获取键值对来累加计算字节数
	try{
		for(index = 0, length = theStorage.length; index < length; index++){
			key = theStorage.key(index),value = theStorage.getItem(key);
			result += ( key.length + (value ? value.length : 0) );
		};
	}catch(error){ consoleError(type, error) };
	return result;
	
};



// 添加回调，创建对象承载 key 和 callback 参数，把对象推入到 listener 数组中，触发事件时进行调用
// 不使用 [{key:callback}] 这样简单的数据结构，是当 clear 操作需要响应全部回调时，就很不好调用了
theReturn.on = function(key, callback){
	
	// 如果存储对象不被支持或参数缺失则直接返回
	if(theReturn.support === false 
	|| arguments.length !== 2){ return };
	
	// 将 key & callback 合成对象推入监听数组中
	theReturn.listener.push(
	{key:key, callback:callback });
	
};



// 删除回调，第二个参数既 callback 是选填的，如果没有传入，那么会把所有符合 key 参数的回调都删除
// 如果有传入第二个参数既 callback，那么会把符合 key % callback 的回调删除，也就是删除会更加精准
theReturn.off = function(key, callback){
	
	// 如果存储对象不被支持或参数缺失则直接返回
	if(theReturn.support === false){ return };
	if(arguments.length === 0){ return };
	var length = arguments.length;
	var temporaryArray = [];
	
	// 根据传入参数判断，如果不是目标对象则保留
	theReturn.listener.forEach(function(object){
		if(length === 1 && object.key !== key){ temporaryArray.push(object) }
		else if(length === 2 && ((object.key === key && object.callback === callback) === false)){ temporaryArray.push(object) };
	});
	
	// 保存回调的数组更新为删掉了目标对象的数组
	theReturn.listener = temporaryArray
	
};



}); // pub_typeList.forEach(function(type){



// ---------------------------------------------------------------------------------------------
// IE 和 Safari(MacOS) 的 Storage 事件存在一个 BUG，就是事件会不遵循标准的在操作数据的页面也响应
// 为了解决 BUG，得能辨别出这些事件，不能靠 event.url 属性判断，因为不同 Tab 页 url 可能是相同的
// 借助 document.hasFocus() 判断也不可取，因为聚焦在当前页时，其他页面也有可能会操作数据引发事件
// 最终的做法是为每个页面都生成 id，将 id 和数据组成一个对象，借助 JSON.stringify() 转码后再存入
// 但由于 removeItem() 和 clear() 操作无法保存数据，所以执行这些操作时得提前先操作一次 setItem()
// 关于让 Storage 事件会在当前页响应的问题可参考 : https://stackoverflow.com/questions/18265556/

// IE11 操作大额数据时导致 Storage 事件不响应是无法解决的，因为使用代理的做法会导致丢失 newValue
// IE11 的 Storage 事件回调是异步的，在回调函数中用 getItem() 方法获取数据并无法保证数据的准确性
// 所以即使能解决事件的响应问题，但因为无法得到响应后的 newValue，那么响应也就没有意义，只能放弃
// 关于 IE11 的这个问题以及代理键值对的做法可参考 : https://stackoverflow.com/questions/21139931

// localStorage 和 sessionStorage 的操作都会响应 Storage 事件，所以在一个 Storage 回调中处理即可
// 为了判断操作数据的来源，所以改造了数据结构，另外就是在回调中能信任的只有 event 对象的属性而已
pub_win.addEventListener('storage', function(event){
	
	
	
	// 创建当前回调函数中需要用到的几个基本变量
	var theStorage = pub_lStorage, theReturn = pub_lsReturn;
	var oldValueObject = null, oldValue = '';
	var newValueObject = null, newValue = '';
	var hasError = false;
	
	// 如果事件属于 sessionStorage 需要修改变量
	if(theStorage !== event.storageArea){
		theStorage = pub_sStorage;
		theReturn = pub_ssReturn;
	};
	
	// 不支持或测试时返回，清空或移除操作也返回
	if(theReturn.support === false){ return };
	if(event.key === 'xj-storage-test-key'){ return };
	if(event.key === null || event.key === ''){ return };
	if(event.newValue === null || event.newValue === ''){ return };
	
	
	
	// 解析 newValue & oldValue，没出错时才继续
	try{
		
		// 新值符合格式才解析，否则回调将被忽略
		if(pub_id_check.test(event.newValue) === true){
			newValueObject = JSON.parse(event.newValue);
			newValue = newValueObject.data;
		}else{ throw 'ignore this event' };
		
		// 旧值符合格式就解析，不符合则直接使用
		if(pub_id_check.test(event.oldValue) === true){
			oldValueObject = JSON.parse(event.oldValue);
			oldValue = oldValueObject.data;
		}else{ oldValue = event.oldValue };
		
	}catch(error){ hasError = true };
	if(hasError === true){ return };
	
	// 如果事件是由当前页自动触发的，那直接返回
	if(event.isTrusted === true && newValueObject.id === pub_id){ return };
	
	
	
	// event 原始对象只读不能改，新建对象来代替
	var storageEvent = {
		url : event.url,
		key : event.key,
		oldValue : oldValue,
		newValue : newValue,
		storageArea : event.storageArea,
	};
	
	// 根据操作校正 key 和 oldValue 和 newValue 
	if(newValueObject.act === 'clear'){
		storageEvent.key = null;
		storageEvent.oldValue = null;
		storageEvent.newValue = null;
	}
	else if(newValueObject.act === 'create'){ storageEvent.oldValue = null }
	else if(newValueObject.act === 'remove'){ storageEvent.newValue = null }
	
	// 遍历保存回调函数的数组，执行对应的回调函数
	theReturn.listener.forEach(function(obj){
		
		// 如果是清空操作，那执行所有回调就可以了
		if(storageEvent.key === null){ obj.callback(storageEvent) }else 
		
		// 不是清空操作，key 得能对得上才允许回调
		if(storageEvent.key === obj.key){ obj.callback(storageEvent) };
		
	});
	
	
	
}, false);



// 返回合集
var returnObject = {
	version : pub_version, 
	localStorage : pub_lsReturn, 
	sessionStorage : pub_ssReturn, 
};
return pub_global.xj.storageReturn[pub_version] = returnObject;

// xj.storage.localStorage 对象和 xj.storage.sessionStorage 对象上的属性与方法
// {
// 
// get : function(key, defaultValue){},
// set : function(key, value){},
// 
// remove : function(key){},
// clear : function(){},
// 
// length : function(){ return Number },
// byte : function(){ return Number },
// key : function(){ return String },
// 
// error : Object,
// support : Boolean,
// listener : [], // [{key:key, callback:callback}]
// 
// on : function(key, callback){},
// off : function(key, callback){},
// 
// }



}));



$(function(){



var jqi_win = $(window);
var jqi_doc = $(document);

var xjls = xj.storage.localStorage;
var xjss = xj.storage.sessionStorage;

var jqi_xjDir01 = $('#xjDir01');
var xjDir01Return = xj.Dir.return[jqi_xjDir01.attr('xjDirId')];

var jqi_xjScroll01 = $('#xjScroll01');
var xjScroll01Return = xj.Scroll.return[jqi_xjScroll01.attr('xjScrollId')];



// ---------------------------------------------------------------------------------------------

// 使用 JS，动态生成 xjZone 其他插件的结构和链接
// html 工整些但不利于 SEO，不过文档的玩意无所谓
$('#xjDir01_ul02').html(
	'<li><a target="_blank" href="https://github.com/xjZone/xj.viewport">'+
		'<i class="xjDir-icon fas fa-tablet-screen-button"></i>'+
		'<i class="xjDir-text"><span>xj.viewport    </span></i>'+
	'</a></li>' + 
	'<li><a target="_blank" href="https://github.com/xjZone/xj.storage" >'+
		'<i class="xjDir-icon fas fa-database"            ></i>'+
		'<i class="xjDir-text"><span>xj.storage     </span></i>'+
	'</a></li>' + 
	'<li><a target="_blank" href="https://github.com/xjZone/xj.operate" >'+
		'<i class="xjDir-icon fas fa-arrow-pointer"       ></i>'+
		'<i class="xjDir-text"><span>xj.operate     </span></i>'+
	'</a></li>' + 
	'<li><a target="_blank" href="https://github.com/xjZone/xj.ripple"  >'+
		'<i class="xjDir-icon fas fa-circle-dot"          ></i>'+
		'<i class="xjDir-text"><span>xj.ripple      </span></i>'+
	'</a></li>' + 
	'<li><a target="_blank" href="https://github.com/xjZone/xj.focus"   >'+
		'<i class="xjDir-icon fas fa-arrows-to-dot"       ></i>'+
		'<i class="xjDir-text"><span>xj.focus       </span></i>'+
	'</a></li>'
);



// ---------------------------------------------------------------------------------------------

// xjDemo 实例化有延迟，将导致刷新后滚动定位不准
// 如果没 hash，就使用 localStorage 保存的值定位
var hashValue = decodeURIComponent(location.hash);
hashValue = hashValue.slice(1);
if(hashValue === ''){
	var LastScrollLeft = xjls.get('xj_storage_index_LastScrollLeft');
	var LastScrollTop  = xjls.get('xj_storage_index_LastScrollTop' );
	if(LastScrollLeft !== null){ jqi_win.scrollLeft(LastScrollLeft) };
	if(LastScrollTop  !== null){ jqi_win.scrollTop(LastScrollTop  ) };
};

// 监听 scroll & hashchange 事件，防抖避免太频繁
// localStorage 记下当前滚动位置，刷新定位用得着
var scrollTimeout01 = undefined;
jqi_win.on('scroll hashchange', function(){
	clearTimeout(scrollTimeout01);
	scrollTimeout01 = setTimeout(function(){
		xjls.set('xj_storage_index_LastScrollLeft', jqi_win.scrollLeft());
		xjls.set('xj_storage_index_LastScrollTop',  jqi_win.scrollTop() );
	}, 250);
});



// ---------------------------------------------------------------------------------------------

// 将 pub_main 的 h2 文本转为 id，但空格替换为 _
// 实际上可能还存在其他 url 非法文本，遇到再说吧
var jqi_h2s = $('#pub_main').find('h2');
jqi_h2s.each(function(){ this.id = 
this.textContent.replace(/\s/g, '_') });

// 用 pub_main 的 h2 生成 xjDir 导航中的 li 标签
// 将 li 标签结构写到 jqi_xjDir01_ul01，并初始化
var xjDirListHtml = '';
var jqi_xjDir01_ul01 = $('#xjDir01_ul01');
jqi_h2s.each(function(){ xjDirListHtml += '<li><a href="#'+ 
this.id +'"><i class="xjDir-text"><span>'+ this.textContent +'</span></i></a></li>' });
jqi_xjDir01_ul01.html(xjDirListHtml);
xjDir01Return.reinit();

// 有 hash 值则定位并选中 xjDir 中对应的 li 节点
// hash 做 id 可能引发 BUG，所以放 try…catch 中
try{ if(hashValue !== ''){
	$('[id="'+ hashValue +'"]').xjArrive([0, -80], 250, 'swing');
	jqi_xjDir01_ul01.find('a[href="#'+ hashValue +'"]')
	.parent('li').addClass('xjDir-active');
}; }catch(error){};

// 阻止 jqi_xjDir01_ul01 中 a 默认事件，改为定位
// id 中可能存在非法符号，得使用属性选择器来选择
jqi_xjDir01_ul01.find('li > a').on('click', function(e){
	e.preventDefault();
	var id = this.getAttribute('href').slice(1);
	$('[id="'+ id +'"]').xjArrive([0,-80], 250);
	location.hash = id;
});



// ---------------------------------------------------------------------------------------------

// 获取 h2 标签的 scrollTop 既所在的位置来成数组
// 窗口宽度的改变会影响布局，所以还得监听 resize
var h2ScrollTopArray = [];
var h2ScrollTopArrayGet = function(){
	h2ScrollTopArray = [];
	jqi_h2s.each(function(index, h2){
		h2ScrollTopArray.push($(h2).offset().top);
	});
};
h2ScrollTopArrayGet();
jqi_win.on('resize', function(e){ h2ScrollTopArrayGet() });

// 监听全局的滚动和重置，以同步导航列表的 active
// 这里也需要防抖，用倒循环判断是否到达了目标 li
var jqi_xjDir01_ul01_lis = jqi_xjDir01_ul01.children('li');
var scrollTimeout02 = undefined, hasActive = false;
jqi_win.on('scroll resize', function(){
	
	clearTimeout(scrollTimeout02);
	scrollTimeout02 = setTimeout(function(){
		var scrollTop = document.scrollingElement.scrollTop;
		for(var i = h2ScrollTopArray.length - 1; i>=0; i--){
			if(h2ScrollTopArray[i] - 100 <= scrollTop){
				xjDir01Return.active(jqi_xjDir01_ul01_lis[i], true);
				hasActive = true;
				break;
			};
		};
		if(hasActive){ hasActive = false }
		else{ jqi_xjDir01_ul01_lis.removeClass('xjDir-active') };
	}, 250);
	
});



// ---------------------------------------------------------------------------------------------

// 用 window.matchMedia() 判断窗口宽度以控制侧边
// 点击按钮展展开 xjDir 而点击遮罩或 li 则是关闭

var jqi_pub_side = $('#pub_side');
var metchMedia_mw1023 = window.matchMedia('(max-width:1023px)');
jqi_win.on('resize', function(){ if(metchMedia_mw1023.matches 
=== false){ jqi_pub_side.removeClass('pub_sideShow') } });

$('#pub_toolSwitchDir').on('click', function(){ jqi_pub_side.addClass('pub_sideShow') });
$('#pub_sideMask').on('click', function(){ jqi_pub_side.removeClass('pub_sideShow') });
jqi_xjDir01_ul01.on('click', function(){ jqi_pub_side.removeClass('pub_sideShow') });

// 点击右下角的按钮返回顶部，这里不能用 xjArrive
// 因为顶部的 head 可能是 position:fixed; 定位的

$('#pub_toolBackToTop').on('click', function(e){
$(document.scrollingElement).stop().animate({scrollTop:0}, 250) });



});
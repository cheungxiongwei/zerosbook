window.onload = function () {
    let util = UIkit.util;

    /*!
    * 依赖 uikit
    * */
    class zeros {
        constructor() {
            this._util = UIkit.util;
            this._title = "zero's";
            this._current_href = null;
            this._tpl = null;
            this._github = 'https://github.com/uikit/uikit/issues'
            console.log("zero's");
        }

        common_config() {
            return {title: "zero's book",};
        }

        el_navbar_top() {//顶部导航栏
            return this._util.$('#');
        }

        el_sidebar_left() {//侧边栏
            return this._util.$('#sidebar_directory');
        }

        el_main_content() {//主体内容
            return this._util.$('#main_content');
        }

        el_sidebar_push() {//弹出侧边栏
            return this._util.$('#min_sidebar_directory');
        }

        change_class_uk_active(el) {
            document.title = `${el.innerText} - zero's`;

            let target = this._util.$('.uk-active', this.el_sidebar_left());
            if (this._util.hasClass(target, 'uk-active')) {
                this._util.removeClass(target, 'uk-active');
            }
            this._util.addClass(el, 'uk-active');
        }

        get current_href() {
            return this._current_href;
        }

        set current_href(value) {
            this._current_href = value;
        }

        //添加小导航栏
        add_main_content_sidebar(){
            this._util.remove(util.$('#right_sidebar div ul'));

            let ids = '';
            this._util.$$('h2 a[href^="#"]', this._util.$(z.el_main_content())).forEach((el) => {
                ids+=`<li><a href="#${sluggify(el.innerText)}">${el.innerText}</a></li>`;
            });

             let tpl =`<ul id="main_right_sidebar" class="uk-nav uk-nav-default tm-nav uk-nav-parent-icon" uk-scrollspy-nav="closest: li; scroll: true; offset: 100">
            ${ids}
            <li class="uk-nav-divider"></li>
            <li>
                <a href="${this._github}" target="_blank">
                <span class="uk-margin-small-right" uk-icon="icon: warning"></span>
                <span class="uk-text-middle">Github</span>
                </a>
            </li></ul>`

            this._util.wrapInner(this._util.$('#right_sidebar div'),tpl);
        }
    }

    let z = new zeros();

    function common_enum_obj(el, obj) {
        for (let [key, value] of Object.entries(obj)) {
            let c = `<li><a href="/pages/${value}.md">${key}</a></li>`;
            util.append(el, c);
        }
    }

    util.ajax('/navigation.json', {method: 'GET', responseType: 'json'})
        .then(function (xhr) {
            // 打印导航栏数据
            //console.log(xhr.response)

            //添加侧边栏数据
            for (let [key, value] of Object.entries(xhr.response)) {// 键值枚举
                let c = `<li class="uk-nav-header">${key}</li>`;
                util.append(z.el_sidebar_left(), c);
                common_enum_obj(z.el_sidebar_left(), value);
            }

            util.on(util.$$('[href="#"]', z.el_main_content()), 'click', e => e.preventDefault());

            util.on(util.$('a:not([href^="http"]):not([href^="#"]):not([href^="/"]):not([href^="../"]):not([href^="images/"])', main_content), 'click', e => {
                e.preventDefault();
                console.log(e.target.pathname + e.target.hash);
            });

            util.on('a[href^="#"]:not([href="#"])', 'click', e => !e.defaultPrevented && history.pushState({}, '', e.target.href));

            window.addEventListener("popstate", function (e) {
                setTimeout(() => {
                    if (location.hash && util.$(location.hash)) {
                        scrollTo(0, util.offset(util.$(location.hash)).top - 100);
                    }
                });
            });

            //拦截侧边栏
            util.on(util.$$("a[href$='.md']", z.el_sidebar_left()), 'click', function (e) {

                let current_href = util.attr(e.target, 'href');
                if (z.current_href != current_href) {
                    z.current_href = current_href;
                    z.change_class_uk_active(e.target.parentNode);
                    //console.log("拦截：",e.target,current_href);

                    util.html(z.el_main_content(), '<div class="uk-position-center" uk-spinner></div>');

                    //加载主体内容
                    util.ajax(`${current_href}`, {method: 'GET', responseType: 'text'})
                        .then(function (xhr) {
                            util.html(z.el_main_content(), parse(xhr.response))
                            //console.log(xhr.response)

                            z.add_main_content_sidebar();

                            setTimeout(() => util.$$('pre code', z.el_main_content()).forEach(block => hljs.highlightBlock(block)));
                        });

                }//end if


                //请求数据
                e.preventDefault();
            });//end on
        });
}

function sluggify(text) {
    return text.toLowerCase().trim().replace(/(&amp;| & )/g, '-and-').replace(/&(.+?);/g, '').replace(/[\s\W-]+/g, '-');
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function uniqid(s) {
    return `${s}${uuidv4()}`
}

function html(el, html) {
    el.innerHTML = '';
    const range = document.createRange();
    range.selectNode(el);
    el.appendChild(range.createContextualFragment(html));
}

// 解析 markdown
function parse(markdown) {

    const renderer = new marked.Renderer({langPrefix: 'lang-'});
    const base = new marked.Renderer({langPrefix: 'lang-'});

    const modal = (href, text) => {
        const slug = `modal-${sluggify(text)}`;
        return `<a href="#${slug}" uk-toggle><p class="uk-margin-large-bottom"><img src="${href}" alt="${text}"></p></a>
                <div id="${slug}" class="uk-modal-full" uk-modal>
                    <div class="uk-modal-dialog uk-flex uk-flex-center uk-flex-middle uk-height-viewport">
                        <button class="uk-modal-close-full" type="button" uk-close></button>
                        <img src="${href}" alt="${text}">
                    </div>
                </div>`;
    };

    let example = code => {
        let id = uniqid('code-');

        return `<div class="uk-position-relative uk-margin-medium">

                    <ul uk-tab>
                        <li><a href="#">Preview</a></li>
                        <li><a href="#">Markup</a></li>
                    </ul>

                    <ul class="uk-switcher uk-margin">
                        <li>${code}</li>
                        <li><pre><code id="${id}" class="lang-html">${he.escape(code)}</code></pre></li>
                    </ul>

                    <div class="uk-position-top-right uk-margin-small-top">
                        <ul class="uk-iconnav">
                            <li><a class="js-copy" uk-tooltip="Copy to Clipboard" rel="#${id}"><img class="uk-icon" src="../images/icon-clipboard.svg" uk-svg></a></li>
                            <li><a class="js-codepen" uk-tooltip="Edit on Codepen" rel="#${id}"><img class="uk-icon" src="../images/icon-flask.svg" uk-svg></a></li>
                        </ul>
                    </div>
                </div>`;
    };

    renderer.strong = text => text === 'Note' ? `<span class="uk-label">${text}</span>` : `<strong>${text}</strong>`;
    renderer.list = text => `<ul class="uk-list uk-list-bullet">${text}</ul>`;
    renderer.image = (href, title, text) => href.match(/modal$/) ? modal(href, text) : base.image(href, title, text);
    renderer.link = (href, title, text) => href.match(/\.md/) ? base.link(href.replace(/.md(.*)/, '$1'), title, text) : base.link(href, title, text);
    renderer.code = (code, lang, escaped) => lang === 'example' ? example(code) : '<div class="uk-margin-medium">' + base.code(code, lang, escaped) + '</div>';
    renderer.hr = () => `<hr class="uk-margin-large">`;
    renderer.table = (header, body) => `<div class="uk-overflow-auto"><table class="uk-table uk-table-divider"><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
    renderer.heading = (text, level) => `<h${level} id="${sluggify(text)}" class="uk-h${level > 1 ? level + 1 : level} tm-heading-fragment"><a href="#${sluggify(text)}">${text}</a></h${level}>`;

    return marked(markdown, {renderer});
}



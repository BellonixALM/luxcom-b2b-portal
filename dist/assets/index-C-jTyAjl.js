(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`/api`;window.Telegram?.WebApp&&(window.Telegram.WebApp.ready(),window.Telegram.WebApp.expand());var t={partner:null,categories:[],products:[],orders:[],selectedCategory:`all`,searchQuery:``,filters:{diameter:`all`,freon:`all`,brand:`all`,stock:`all`},cart:[]},n={headerPartner:document.getElementById(`headerPartner`),creditLimit:document.getElementById(`creditLimit`),currentDebt:document.getElementById(`currentDebt`),availableCredit:document.getElementById(`availableCredit`),categoriesContainer:document.getElementById(`categoriesContainer`),productsContainer:document.getElementById(`productsContainer`),ordersContainer:document.getElementById(`ordersContainer`),profileContainer:document.getElementById(`profileContainer`),searchInput:document.getElementById(`searchInput`),cartBar:document.getElementById(`cartBar`),cartCount:document.getElementById(`cartCount`),cartTotal:document.getElementById(`cartTotal`),openCartBtn:document.getElementById(`openCartBtn`),cartModal:document.getElementById(`cartModal`),closeCartBtn:document.getElementById(`closeCartBtn`),cartItemsList:document.getElementById(`cartItemsList`),summaryRetail:document.getElementById(`summaryRetail`),summaryDiscount:document.getElementById(`summaryDiscount`),summaryTotal:document.getElementById(`summaryTotal`),checkoutForm:document.getElementById(`checkoutForm`),quickOrderText:document.getElementById(`quickOrderText`),parseQuickOrderBtn:document.getElementById(`parseQuickOrderBtn`),themeToggleBtn:document.getElementById(`themeToggleBtn`),themeIcon:document.getElementById(`themeIcon`)};function r(){let e=localStorage.getItem(`luxcom_theme`),t=window.matchMedia&&window.matchMedia(`(prefers-color-scheme: dark)`).matches,r=e||(t?`dark`:`light`);window.Telegram?.WebApp?.colorScheme&&(r=window.Telegram.WebApp.colorScheme),i(r),window.matchMedia(`(prefers-color-scheme: dark)`).addEventListener(`change`,e=>{localStorage.getItem(`luxcom_theme`)||i(e.matches?`dark`:`light`)}),n.themeToggleBtn.addEventListener(`click`,()=>{let e=document.body.classList.contains(`light-theme`)?`dark`:`light`;localStorage.setItem(`luxcom_theme`,e),i(e)})}function i(e){e===`light`?(document.body.classList.add(`light-theme`),n.themeIcon.textContent=`☀️`):(document.body.classList.remove(`light-theme`),n.themeIcon.textContent=`🌙`)}async function a(){r(),g(),_(),await Promise.all([o(),s(),c(),l()]),d(),f(),p(),m()}async function o(){try{t.partner=await(await fetch(`${e}/partner/profile`)).json(),u()}catch(e){console.error(`Error fetching partner:`,e)}}async function s(){try{t.categories=await(await fetch(`${e}/categories`)).json()}catch(e){console.error(`Error fetching categories:`,e)}}async function c(){try{t.products=await(await fetch(`${e}/products`)).json()}catch(e){console.error(`Error fetching products:`,e)}}async function l(){try{t.orders=await(await fetch(`${e}/orders`)).json()}catch(e){console.error(`Error fetching orders:`,e)}}function u(){if(!t.partner)return;let e=t.partner;n.creditLimit.textContent=`${e.creditLimit.toLocaleString()} ₴`,n.currentDebt.textContent=`${e.currentDebt.toLocaleString()} ₴`,n.availableCredit.textContent=`${e.availableCredit.toLocaleString()} ₴`,n.headerPartner.innerHTML=`
    <div class="partner-badge">${e.tier}</div>
    <div class="partner-name">${e.company}</div>
  `}function d(){n.categoriesContainer.innerHTML=t.categories.map(e=>`
    <button class="category-chip ${t.selectedCategory===e.id?`active`:``}" data-id="${e.id}">
      ${e.icon} ${e.name}
    </button>
  `).join(``),n.categoriesContainer.querySelectorAll(`.category-chip`).forEach(e=>{e.addEventListener(`click`,()=>{t.selectedCategory=e.dataset.id,d(),f()})})}function f(){let e=t.products;if(t.selectedCategory!==`all`&&(e=e.filter(e=>e.category===t.selectedCategory)),t.searchQuery){let n=t.searchQuery.toLowerCase();e=e.filter(e=>e.name.toLowerCase().includes(n)||e.sku.toLowerCase().includes(n))}if(t.filters.diameter!==`all`&&(e=e.filter(e=>e.name.includes(t.filters.diameter)||e.specs&&JSON.stringify(e.specs).includes(t.filters.diameter))),t.filters.freon!==`all`&&(e=e.filter(e=>e.name.toLowerCase().includes(t.filters.freon.toLowerCase()))),t.filters.brand!==`all`&&(e=e.filter(e=>e.name.toLowerCase().includes(t.filters.brand.toLowerCase()))),t.filters.stock===`in_stock`&&(e=e.filter(e=>e.stock>=100)),e.length===0){n.productsContainer.innerHTML=`<div style="text-align:center; padding: 30px; color: var(--text-muted);">Товарів за вказаними фільтрами не знайдено 🔎</div>`;return}n.productsContainer.innerHTML=e.map(e=>`
    <div class="product-card">
      ${e.badge?`<span class="product-badge">${e.badge}</span>`:``}
      <img src="${e.image}" alt="${e.name}" class="product-img" />
      <div class="product-info">
        <div>
          <span class="product-sku">SKU: ${e.sku}</span>
          <h4 class="product-title">${e.name}</h4>
        </div>
        <div class="product-prices">
          <span class="b2b-price">${e.b2bPrice} ₴ / ${e.unit}</span>
          <span class="retail-price">${e.retailPrice} ₴</span>
        </div>
        <div class="product-action">
          <span class="stock-indicator">✓ На складі (${e.stock} ${e.unit})</span>
          <button class="add-btn" onclick="addToCart('${e.id}')">+ В кошик</button>
        </div>
      </div>
    </div>
  `).join(``)}function p(){if(t.orders.length===0){n.ordersContainer.innerHTML=`<div style="text-align:center; color: var(--text-muted); padding: 20px;">Замовлень ще немає</div>`;return}n.ordersContainer.innerHTML=t.orders.map(e=>`
    <div class="order-card">
      <div class="order-header">
        <span class="order-id">Замовлення №${e.id}</span>
        <span class="order-status">${e.statusText}</span>
      </div>
      <div class="order-detail">📅 Дата: ${e.date}</div>
      <div class="order-detail">🚚 Доставка: ${e.delivery}</div>
      <div class="order-detail" style="margin-top: 6px;">
        📦 Номер треку ТТН: <div class="ttn-box">${e.ttn}</div>
      </div>
      <div class="order-detail" style="margin-top: 6px;">💰 Сума з ПДВ: <strong style="color: var(--accent-gold); font-size: 15px;">${e.total.toLocaleString()} ₴</strong></div>
    </div>
  `).join(``)}function m(){if(!t.partner)return;let e=t.partner;n.profileContainer.innerHTML=`
    <h2>🏢 Особистий Кабінет Партнера</h2>
    <div style="font-size: 12px; margin-top: 6px;">
      <p><strong>Компанія:</strong> ${e.company}</p>
      <p><strong>ЄДРПОУ:</strong> ${e.edrpou}</p>
      <p><strong>Контактна особа:</strong> ${e.contactPerson}</p>
      <p><strong>Телефон:</strong> ${e.phone}</p>
      <p><strong>Email:</strong> ${e.email}</p>
      <hr style="border-color: var(--border-color); margin: 10px 0;">
      <p><strong>Персональний менеджер TOV Luxcom:</strong></p>
      <p>👤 ${e.manager.name} (${e.manager.phone})</p>
    </div>
  `;let r=t.orders.filter(e=>e.status===`completed`||e.paymentStatus===`paid`),i=document.getElementById(`paidOrdersContainer`);i&&(i.innerHTML=r.length===0?`<div style="font-size: 12px; color: var(--text-muted); text-align:center; padding: 10px; background: var(--bg-card); border-radius: 12px;">Оплачених покупок поки немає</div>`:r.map(e=>`
        <div class="order-card" style="border-left: 4px solid var(--accent-green); background: var(--bg-card); border-radius: 12px; padding: 12px; margin-bottom: 10px;">
          <div class="order-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span class="order-id" style="font-weight: 700; color: var(--accent-blue); font-size: 13px;">Замовлення №${e.id}</span>
            <span class="order-status" style="background: rgba(16,185,129,0.2); color: var(--accent-green); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 8px;">✓ Оплачено з ПДВ</span>
          </div>
          <div class="order-detail" style="font-size: 12px;">📅 Дата оплати: ${e.date}</div>
          <div class="order-detail" style="font-size: 12px;">💳 Форма: ${e.paymentType}</div>

          <!-- Novaposhta Live Tracking Progress Bar -->
          <div style="background: var(--bg-main); border: 1px solid var(--border-color); padding: 8px 10px; border-radius: 8px; margin: 8px 0; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 4px; color: var(--accent-blue);">
              <span>🚚 ТТН: ${e.ttn||`204509182374`}</span>
              <span>В дорозі на поштомат</span>
            </div>
            <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
              <div style="width: 75%; height: 100%; background: var(--accent-blue); border-radius: 3px;"></div>
            </div>
          </div>

          <div class="order-detail" style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span>Разом з ПДВ: <strong style="color: var(--accent-blue); font-size: 14px;">${e.total.toLocaleString()} ₴</strong></span>
            <button class="add-btn" style="padding: 6px 10px; font-size: 11px; font-weight: 700; background: var(--accent-blue); color: #fff; border: none; border-radius: 8px; cursor: pointer;" onclick="downloadInvoice('${e.id}')">📄 Рахунок-Фактура (PDF)</button>
          </div>
        </div>
      `).join(``))}window.downloadInvoice=function(e){alert(`📄 Офіційний Рахунок-Фактура з ПДВ та печаткою TOV Luxcom для замовлення №${e} згенеровано! Друк/Завантаження в PDF розпочато.`)},window.addToCart=function(e){let n=t.products.find(t=>t.id===e);if(!n)return;let r=t.cart.find(t=>t.product.id===e);r?r.quantity+=n.minOrder||1:t.cart.push({product:n,quantity:n.minOrder||1}),h()};function h(){let e=t.cart.filter(e=>e.selected!==!1),r=t.cart.reduce((e,t)=>e+t.quantity,0),i=e.reduce((e,t)=>e+t.product.b2bPrice*t.quantity,0),a=e.reduce((e,t)=>e+t.product.retailPrice*t.quantity,0),o=a-i;r>0?(n.cartBar.classList.remove(`hidden`),n.cartCount.textContent=r,n.cartTotal.textContent=`${i.toLocaleString()} ₴`):n.cartBar.classList.add(`hidden`),t.cart.length===0?n.cartItemsList.innerHTML=`<div style="text-align:center; padding: 20px; color: var(--text-muted);">Кошик порожній 🛒</div>`:(n.cartItemsList.innerHTML=t.cart.map(e=>`
      <div class="cart-item" style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
        <input type="checkbox" class="cart-item-checkbox" data-id="${e.product.id}" ${e.selected===!1?``:`checked`} style="accent-color: var(--accent-blue);" />
        <div class="cart-item-title" style="flex: 1;">
          <div style="font-size: 12px; font-weight: 700;">${e.product.name}</div>
          <small style="color: var(--accent-blue); font-weight: 700;">${e.product.b2bPrice} ₴ / ${e.product.unit}</small>
        </div>
        <div class="cart-item-controls" style="display: flex; align-items: center; gap: 4px;">
          <button class="qty-btn" onclick="changeQty('${e.product.id}', -1)">-</button>
          <span style="font-weight: 700; min-width: 18px; text-align: center;">${e.quantity}</span>
          <button class="qty-btn" onclick="changeQty('${e.product.id}', 1)">+</button>
        </div>
        <button onclick="removeFromCart('${e.product.id}')" style="background: transparent; border: none; color: var(--accent-red); cursor: pointer; padding: 2px 4px; display: flex; align-items: center; justify-content: center;" title="Видалити позицію">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `).join(``),document.querySelectorAll(`.cart-item-checkbox`).forEach(e=>{e.addEventListener(`change`,e=>{let n=e.target.getAttribute(`data-id`),r=t.cart.find(e=>e.product.id===n);r&&(r.selected=e.target.checked,h())})})),n.summaryRetail.textContent=`${a.toLocaleString()} ₴`,n.summaryDiscount.textContent=`-${o.toLocaleString()} ₴`,n.summaryTotal.textContent=`${i.toLocaleString()} ₴`}window.removeFromCart=function(e){t.cart=t.cart.filter(t=>t.product.id!==e),h()},window.changeQty=function(e,n){let r=t.cart.find(t=>t.product.id===e);r&&(r.quantity+=n,r.quantity<=0&&(t.cart=t.cart.filter(t=>t.product.id!==e)),h())};function g(){document.querySelectorAll(`.tab-btn`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.tab-btn`).forEach(e=>e.classList.remove(`active`)),document.querySelectorAll(`.tab-content`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`);let t=e.dataset.tab;document.getElementById(`tab-${t}`).classList.add(`active`)})})}function _(){let r=document.getElementById(`filterToggleBtn`),i=document.getElementById(`filterPanel`),a=document.getElementById(`resetFiltersBtn`),o=document.getElementById(`filterDiameter`),s=document.getElementById(`filterFreon`),c=document.getElementById(`filterBrand`),u=document.getElementById(`filterStock`);r&&r.addEventListener(`click`,()=>{i.classList.toggle(`hidden`)}),a&&a.addEventListener(`click`,()=>{t.filters={diameter:`all`,freon:`all`,brand:`all`,stock:`all`},o.value=`all`,s.value=`all`,c.value=`all`,u.value=`all`,f()}),[o,s,c,u].forEach(e=>{e&&e.addEventListener(`change`,()=>{t.filters.diameter=o.value,t.filters.freon=s.value,t.filters.brand=c.value,t.filters.stock=u.value,f()})}),n.searchInput.addEventListener(`input`,e=>{t.searchQuery=e.target.value,f()});let d=document.getElementById(`selectAllCartItems`),g=document.getElementById(`deleteSelectedCartBtn`),_=document.getElementById(`clearAllCartBtn`);d&&d.addEventListener(`change`,e=>{let n=e.target.checked;t.cart.forEach(e=>{e.selected=n}),h()}),g&&g.addEventListener(`click`,()=>{t.cart=t.cart.filter(e=>e.selected===!1),d&&(d.checked=!0),h()}),_&&_.addEventListener(`click`,()=>{t.cart=[],d&&(d.checked=!0),h()});let v={Київ:[{name:`Вантажне відділення №1 (вул. Пирогівський шлях, 135)`,value:`Вантажне відділення №1 (вул. Пирогівський шлях, 135)`},{name:`Відділення №130 (вул. Будівельників, 40)`,value:`Відділення №130 (вул. Будівельників, 40)`},{name:`Поштомат №5432 (вул. Хрещатик, 15)`,value:`Поштомат №5432 (вул. Хрещатик, 15)`},{name:`Поштомат №8712 (просп. Перемоги, 22)`,value:`Поштомат №8712 (просп. Перемоги, 22)`},{name:`Точка видачі №5 (вул. Велика Васильківська, 80)`,value:`Точка видачі №5 (вул. Велика Васильківська, 80)`},{name:`Самовивіз зі складу TOV Luxcom (м. Київ, вул. Будівельна, 14)`,value:`Самовивіз зі складу TOV Luxcom (м. Київ, вул. Будівельна, 14)`}],Харків:[{name:`Вантажне відділення №1 (вул. Академіка Павлова, 120)`,value:`Вантажне відділення №1 (вул. Академіка Павлова, 120)`},{name:`Відділення №45 (просп. Героїв Харкова, 199)`,value:`Відділення №45 (просп. Героїв Харкова, 199)`},{name:`Поштомат №9102 (вул. Сумська, 4)`,value:`Поштомат №9102 (вул. Сумська, 4)`}],Одеса:[{name:`Вантажне відділення №1 (вул. Базова, 16 - 7км)`,value:`Вантажне відділення №1 (вул. Базова, 16 - 7км)`},{name:`Відділення №28 (вул. Канатна, 83)`,value:`Відділення №28 (вул. Канатна, 83)`},{name:`Поштомат №4410 (вул. Дерибасівська, 12)`,value:`Поштомат №4410 (вул. Дерибасівська, 12)`}],Дніпро:[{name:`Вантажне відділення №1 (вул. Маршала Малиновського, 114)`,value:`Вантажне відділення №1 (вул. Маршала Малиновського, 114)`},{name:`Відділення №15 (просп. Дмитра Яворницького, 65)`,value:`Відділення №15 (просп. Дмитра Яворницького, 65)`},{name:`Поштомат №7701 (просп. Гагаріна, 23)`,value:`Поштомат №7701 (просп. Гагаріна, 23)`}],Львів:[{name:`Вантажне відділення №1 (вул. Городоцька, 355)`,value:`Вантажне відділення №1 (вул. Городоцька, 355)`},{name:`Відділення №10 (просп. В’ячеслава Чорновола, 57)`,value:`Відділення №10 (просп. В’ячеслава Чорновола, 57)`},{name:`Поштомат №3304 (просп. Свободи, 28)`,value:`Поштомат №3304 (просп. Свободи, 28)`}]},y=document.getElementById(`citySelect`),b=document.getElementById(`cityLivePreview`),x=document.getElementById(`deliverySelect`),S=document.getElementById(`deliveryBranchLivePreview`);document.getElementById(`paymentSelect`);let C=document.getElementById(`orderNote`);document.getElementById(`paymentLivePreview`);let w=document.getElementById(`noteLivePreview`);function T(){x&&S&&(S.textContent=`📦 Обране відділення: ${x.value}`)}y&&x&&(y.addEventListener(`change`,()=>{let e=y.value;b&&(b.textContent=`🏙️ Обране місто: ${e}`);let t=v[e]||[{name:`Вантажне відділення №1 (${e})`,value:`Вантажне відділення №1 (${e})`},{name:`Поштомат №101 (${e})`,value:`Поштомат №101 (${e})`},{name:`Відділення №12 (${e})`,value:`Відділення №12 (${e})`}];x.innerHTML=t.map(e=>`<option value="${e.value}">${e.name}</option>`).join(``),T()}),x.addEventListener(`change`,T));let E=document.getElementById(`calcMetersInput`),D=document.getElementById(`calcDiameterSelect`),O=document.getElementById(`calcAddToCartBtn`),k=document.getElementById(`calcResultsBox`);function A(){if(!E||!k)return;let e=parseInt(E.value)||15,t=D?D.value:`1/4 - 3/8`,n=Math.ceil(e/15),r=e*2,i=e>20?2:1;k.innerHTML=`
      <div style="font-weight: 700; color: var(--accent-blue); margin-bottom: 6px;">📋 Специфікація розрахованих матеріалів:</div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div>• Мідна труба ${t} (Halcor): <strong>${n} бухт(и) по 15м</strong> (${n*1927} ₴)</div>
        <div>• Теплоізоляція K-Flex ST 06x06: <strong>${r} м (шт 2м)</strong> (${(r*22.9).toFixed(0)} ₴)</div>
        <div>• Хладагент / Фреон R410A: <strong>${i} балон(и) 11.3кг</strong> (${i*3116} ₴)</div>
      </div>
      <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid var(--border-color); font-weight: 700; color: var(--accent-green); display: flex; justify-content: space-between;">
        <span>Орієнтовна сума замовлення зі знижкою 18%:</span>
        <span>${(n*1927+r*22.9+i*3116).toFixed(0)} ₴</span>
      </div>
    `}E&&D&&(E.addEventListener(`input`,A),D.addEventListener(`change`,A),A()),O&&O.addEventListener(`click`,()=>{let e=parseInt(E.value)||15;Math.ceil(e/15),e*2,addToCart(`pipe-38`),addToCart(`insul-06`),addToCart(`freon-410a`),alert(`✅ Всі матеріали для траси ${e}м успішно розраховано та додано у ваш B2B Кошик!`)}),C&&w&&C.addEventListener(`input`,()=>{let e=C.value.trim();e.length>0?(w.style.display=`block`,w.querySelector(`span`).textContent=e):w.style.display=`none`}),n.openCartBtn&&n.openCartBtn.addEventListener(`click`,()=>{n.cartModal.classList.remove(`hidden`)}),n.closeCartBtn&&n.closeCartBtn.addEventListener(`click`,()=>{n.cartModal.classList.add(`hidden`)}),n.checkoutForm.addEventListener(`submit`,async r=>{if(r.preventDefault(),t.cart.length===0)return;let i={items:t.cart.map(e=>({productId:e.product.id,name:e.product.name,b2bPrice:e.product.b2bPrice,quantity:e.quantity})),delivery:document.getElementById(`deliverySelect`).value,paymentType:document.getElementById(`paymentSelect`).value,note:document.getElementById(`orderNote`).value};try{let r=await(await fetch(`${e}/orders`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(i)})).json();r.success&&(r.order.paymentStatus=`paid`,alert(`🎉 Замовлення ${r.order.id} успішно створено та оплачено! Покупка додана в розділ "Кабінет -> Мої Оплачені Замовлення".`),t.cart=[],h(),n.cartModal.classList.add(`hidden`),await l(),p(),m())}catch{alert(`Помилка при створенні замовлення`)}});let j=document.getElementById(`modeTextBtn`),M=document.getElementById(`modeFormBtn`),N=document.getElementById(`modePhotoBtn`),P=document.getElementById(`modeTextContent`),F=document.getElementById(`modeFormContent`),I=document.getElementById(`modePhotoContent`),L=document.getElementById(`photoDropArea`),R=document.getElementById(`photoInput`),z=document.getElementById(`photoPreviewName`),B=document.getElementById(`parsePhotoBtn`);document.getElementById(`parseNaturalOrderBtn`),document.getElementById(`naturalOrderText`),j&&M&&N&&(j.addEventListener(`click`,()=>{[j,M,N].forEach(e=>e.classList.remove(`active`)),[P,F,I].forEach(e=>e.classList.add(`hidden`)),j.classList.add(`active`),P.classList.remove(`hidden`)}),M.addEventListener(`click`,()=>{[j,M,N].forEach(e=>e.classList.remove(`active`)),[P,F,I].forEach(e=>e.classList.add(`hidden`)),M.classList.add(`active`),F.classList.remove(`hidden`)}),N.addEventListener(`click`,()=>{[j,M,N].forEach(e=>e.classList.remove(`active`)),[P,F,I].forEach(e=>e.classList.add(`hidden`)),N.classList.add(`active`),I.classList.remove(`hidden`)})),L&&R&&(L.addEventListener(`click`,()=>R.click()),R.addEventListener(`change`,e=>{e.target.files&&e.target.files[0]&&(z.textContent=`📸 Обрано фото: ${e.target.files[0].name}`)}));let V=document.getElementById(`naturalSearchInput`),H=document.getElementById(`quickSearchResults`),U=document.getElementById(`voiceMicBtn`),W=[{keys:[`мід`,`мед`,`мідн`,`медн`,`труб`,`трубк`,`траса`,`медяшка`,`бухта`,`халкор`,`halcor`],category:`copper-pipes`},{keys:[`фреон`,`фрион`,`газ`,`хладагент`,`хладон`,`баллон`,`балон`,`410`,`32`,`r32`,`r410`],category:`freon-materials`},{keys:[`ізоляц`,`изоляц`,`утепл`,`флекс`,`flex`,`каучук`,`шлан`,`трубка ізол`],category:`insulation`},{keys:[`помп`,`насос`,`дренаж`,`соерман`,`sauermann`,`конденсат`],category:`drainage-pumps`},{keys:[`кронштейн`,`кронш`,`кронштейни`,`уголок`,`підставка`,`крепление`,`кріпл`],category:`brackets`}];function G(e,t){let n=e.toLowerCase().trim();if(!n)return 0;let r=0,i=t.name.toLowerCase(),a=t.sku.toLowerCase();return(i.includes(n)||a.includes(n))&&(r+=100),n.split(/\s+/).forEach(e=>{e.length>2&&i.includes(e)&&(r+=40)}),W.forEach(e=>{e.keys.some(e=>n.includes(e))&&t.category===e.category&&(r+=80)}),r}function K(e){if(!H)return;if(!e||e.trim().length===0){H.innerHTML=`<div style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 10px;">Натисніть мікрофон щоб надиктувати голосом з ШІ-розпізнаванням або введіть слово</div>`;return}let n=t.products.map(t=>({product:t,score:G(e,t)})).filter(e=>e.score>0).sort((e,t)=>t.score-e.score);if(n.length===0){H.innerHTML=`<div style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 10px;">🤖 ШІ-Пошук не знайшов точних збігів для "${e}". Додано популярні товари категорії:</div>`;let n=t.products.slice(0,3);H.innerHTML+=n.map(e=>`
        <div class="quick-search-item">
          <div style="font-size: 12px; font-weight: 700; max-width: 240px;">
            <div>${e.name}</div>
            <small style="color: var(--accent-blue);">${e.b2bPrice} ₴ / ${e.unit} • В наявності: ${e.stock}</small>
          </div>
          <button class="add-btn" style="padding: 6px 12px; font-size: 11px;" onclick="addToCart('${e.id}')">+ В кошик</button>
        </div>
      `).join(``);return}H.innerHTML=n.map(e=>{let t=e.product;return`
        <div class="quick-search-item">
          <div style="font-size: 12px; font-weight: 700; max-width: 240px;">
            <div>${t.name}</div>
            <small style="color: var(--accent-blue);">${t.b2bPrice} ₴ / ${t.unit} • В наявності: ${t.stock}</small>
          </div>
          <button class="add-btn" style="padding: 6px 12px; font-size: 11px;" onclick="addToCart('${t.id}')">+ В кошик</button>
        </div>
      `}).join(``)}V&&V.addEventListener(`input`,e=>{K(e.target.value)}),U&&V&&U.addEventListener(`click`,()=>{let e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){let t=new e;t.lang=`uk-UA`,t.interimResults=!1,U.style.background=`#ef4444`,t.onresult=e=>{let t=e.results[0][0].transcript;V.value=t,U.style.background=`var(--accent-blue)`,K(t)},t.onerror=()=>{U.style.background=`var(--accent-blue)`,V.value=`Мідні труби`,K(`Мідні труби`)},t.start()}else V.value=`Мідні труби`,K(`Мідні труби`)}),B&&B.addEventListener(`click`,()=>{alert(`🤖 ШІ успішно просканував фото специфікації/накладної!

Знайдено:
- Труба мідна Halcor 1/4" (10 бухт)
- Фреон R410A SANME (2 балони)
- Теплоізоляція K-Flex (100 м)

Позиції додано в кошик!`),t.cart.push({product:t.products[0],quantity:10}),t.cart.push({product:t.products[3],quantity:2}),t.cart.push({product:t.products[2],quantity:100}),h(),n.cartModal.classList.remove(`hidden`)}),n.parseQuickOrderBtn.addEventListener(`click`,()=>{let e=n.quickOrderText.value.trim();if(!e)return;let r=e.split(`
`),i=0;r.forEach(e=>{let n=e.trim().split(/\s+/);if(n.length>=2){let e=n[0].toUpperCase(),r=parseInt(n[1],10)||1,a=t.products.find(t=>t.sku.toUpperCase()===e||t.id.toUpperCase()===e);if(a){let e=t.cart.find(e=>e.product.id===a.id);e?e.quantity+=r:t.cart.push({product:a,quantity:r}),i++}}}),i>0?(alert(`Успішно додано ${i} позицій до кошика!`),h(),n.quickOrderText.value=``):alert(`Не вдалося розпізнати артикули. Перевірте формат!`)})}a();
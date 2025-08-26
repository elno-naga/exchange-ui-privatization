<!-- // Created by 任泽阳 on 18/12/05.
// 头部组件 -->
<template>

  <header
    class="common-header v5-header fill-2-bg text-1-cl"
    :class="{ 'int-header': navigationType === '2' }"
    :style="{ minWidth: hideNav ? 'auto' : '' }"
  >
    <!-- 中国版 -->
    <i v-if="!logoUrl"></i>
    <section
      v-if="navigationType === '1' && headerTemplateReceived"
      class="v5-header_wrap"
    >
      <!-- 主流板块 -->
      <div class="header-nav_section">
        <!-- logo -->
        <div class="logo-icon">
          <a @click="btnHref(headerLink.home)">
            <img :src="logoUrl" alt="" />
          </a>
        </div>
        <template v-if="!hideNav">
          <ul
            class="header-nav_wrap navigation-type_one"
            v-if="navType === 1"
          >
            <!-- 导航 -->
            <li
              v-for="(item, index) in headerList"
              :key="index"
              class="header-nav_item"
              :class="{ 'main-1-cl': navHover === item.id }"
              @click="btnHref(item.httpUrl)"
              @mouseover="navHover = item.id"
              @mouseout="navHover = null"
            >
              <span>
                {{ item.title }}

                <!-- ****** -->
                <span v-if="item.superscriptIconType" class="nav-subscript">
                  <img :src="item.superscriptIcon" alt="" />
                </span>
                <!-- ****** -->
                <span v-if="item.childList && item.childList.length > 0">
                  <svg
                    aria-hidden="true"
                    class="icon icon-12 hoverHide triangle"
                    width="200"
                    height="200"
                    viewBox="0 0 1024 1024"
                    v-html="getIconPath('triangle', 'text-1-cl')"
                  ></svg>
                  <svg
                    aria-hidden="true"
                    class="icon icon-12 hoverShow triangle"
                    width="200"
                    height="200"
                    viewBox="0 0 1024 1024"
                    v-html="getIconPath('triangle', 'main-1-cl')"
                  ></svg>
                </span>
              </span>
              <ul
                class="header-subNav_wrap text-1-cl special-1-bg"
                v-if="item.childList && item.childList.length > 0"
              >
                <li
                  v-for="(sub, i) in item.childList"
                  :key="i"
                  class="header-subNav_item"
                  :class="{
                    'special-2-bg': subNavHover === sub.id,
                  }"
                  @click.stop="btnHref(sub.httpUrl)"
                  @mouseover="subNavHover = sub.id"
                  @mouseout="subNavHover = null"
                >
                  {{ sub.title }}
                  <!-- ****** -->
                  <span
                    v-if="sub.superscriptIconType !== 0"
                    class="sub-nav-subscript"
                  >
                    <img :src="sub.superscriptIcon" alt="" />
                  </span>
                  <!-- ****** -->
                </li>
              </ul>
            </li>
          </ul>
          <ul class="header-nav_wrap navigation-type_two" v-else>
            <!-- 导航 -->
            <li
              v-for="(item, index) in headerList"
              :key="index"
              class="header-nav_item"
              :class="{ 'main-1-cl': navHover === item.id }"
              @click="btnHref(item.httpUrl)"
              @mouseover="navHover = item.id"
              @mouseout="navHover = null"
            >
              <span>
                {{ item.title }}

                <!-- ****** -->
                <span v-if="item.superscriptIconType" class="nav-subscript">
                  <img :src="item.superscriptIcon" alt="" />
                </span>
                <!-- ***** -->
                <span v-if="item.childList && item.childList.length > 0">
                  <svg
                    aria-hidden="true"
                    class="icon icon-12 hoverHide triangle"
                    width="200"
                    height="200"
                    viewBox="0 0 1024 1024"
                    v-html="getIconPath('triangle', 'text-1-cl')"
                  ></svg>
                  <svg
                    aria-hidden="true"
                    class="icon icon-12 hoverShow triangle"
                    width="200"
                    height="200"
                    viewBox="0 0 1024 1024"
                    v-html="getIconPath('triangle', 'main-1-cl')"
                  ></svg>
                </span>
              </span>
              <ul
                class="header-subNav_wrap text-1-cl special-1-bg"
                v-if="item.childList && item.childList.length > 0"
              >
                <li
                  v-for="(sub, i) in item.childList"
                  :key="i"
                  class="header-subNav_item"
                  :class="{
                    'special-2-bg': subNavHover === sub.id,
                  }"
                  @click.stop="btnHref(sub.httpUrl)"
                  @mouseover="subNavHover = sub.id"
                  @mouseout="subNavHover = null"
                >
                  <!-- 日舰版 -->
                  <img
                    v-if="Dskin === '2'"
                    class="logo"
                    :src="sub.imageUrl"
                    alt=""
                  />
                  <!-- 夜间版 -->
                  <img
                    v-else
                    class="logo"
                    :src="sub.logoNavDark || sub.imageUrl"
                    alt=""
                  />
                  <!-- 角标 -->
                  <dl>
                    <dt class="title">
                      {{ sub.title }}
                      <span
                        v-if="sub.superscriptIconType !== 0"
                        class="sub-nav-subscript"
                      >
                         <img :src="sub.superscriptIcon" alt="" />
                      </span>
                    </dt>
                    <dd class="subTitle text-2-cl">{{ sub.subtitle }}</dd>
                  </dl>

                  <span class="active-icon">
                    <svg
                      class="icon icon-20"
                      viewBox="0 0 1024 1024"
                      v-html="getIconPath('go_next', 'main-1-cl')"
                    ></svg>
                  </span>
                </li>
              </ul>
            </li>
          </ul>
        </template>
      </div>
      <!-- 公共版款 -->
      <div class="header-options_wrap">
        <!-- 未登录时  v-if="loginHide === '0'"-->
        <div class="header-sign" v-if="!isLogin && userInfoIsReady">
          <span
            v-if="$route.name !== 'login'"
            :style="{ marginRight: $route.name !== 'register' ? '20px' : 0 }"
            class="login-btn"
            @click="btnLink('/login')"
            :class="{ 'main-1-cl': navHover === 'login' }"
            @mouseover="handMouseenter('login')"
            @mouseout="handMouseleave"
          >
            <!-- 登录 v-if="registerHide === '0'"-->
            {{ $t("header.login") }}
          </span>
          <span
            v-if="$route.name !== 'register'"
            class="register-btn main-1-bg  main-2-cl-h text-4-cl"
            @click="btnLink('/register')"
          >
            <!-- 注册 -->
            {{ $t("header.register") }}
            <i class="hover-layout"></i>
          </span>
        </div>
        <div class="header-isLogin_options" v-if="isLogin && userInfoIsReady">
          <!-- 资产 -->
          <div class="header-options_title">
            <div
              class="header-options_title--text"
              :class="{ 'main-1-cl': navHover === 'assets' }"
              @mouseover="handMouseenter('assets')"
              @mouseout="handMouseleave"
              @click="btnLink(assetsList.length > 1 ? '/assets/totalAssets' : assetsList[0].link)">
              {{ $t('header.assets') }}
            </div>
            <ul class="options-list text-1-cl special-1-bg">
              <li
                class="options-list_item"
                v-for="(item, index) in assetsList"
                @click="btnLink(item.link)"
                :class="{ 'special-2-bg': subNavHover === 'assets' + index }"
                @mouseover="handMouseenter('assets' + index, 'sub')"
                @mouseout="handMouseleave('sub')"
                :key="index"
              >
                {{ item.title }}
              </li>
            </ul>
          </div>
          <!-- 订单 -->
          <div class="header-options_title">
            <div
              class="header-options_title--text"
              :class="{ 'main-1-cl': navHover === 'order' }"
              @mouseover="handMouseenter('order')"
              @mouseout="handMouseleave"
              @click="btnLink('order')"
            >
              {{ $t("header.order") }}
            </div>
            <ul class="options-list text-1-cl special-1-bg">
              <li
                class="options-list_item"
                v-for="(item, index) in orderList"
                @click="btnLink(item.link)"
                :class="{ 'special-2-bg': subNavHover === 'order' + index }"
                @mouseover="handMouseenter('order' + index, 'sub')"
                @mouseout="handMouseleave('sub')"
                :key="index"
              >
                {{ item.title }}
              </li>
            </ul>
          </div>
        </div>
        <!-- app下载 -->
        <div class="header-options_title"
             v-if="(appDownload.android_download_url||appDownload.ios_download_url||appDownload.ios_ipa_download_url||appDownload.google_play_url||appDownload.ios_test_flight_url)">
          <div
            class="header-options_title--text"
            :class="{ 'main-1-cl': navHover === 'download' }"
            @mouseover="handMouseenter('download')"
            @mouseout="handMouseleave"
          >
            {{ $t("h5Add.download") }}
          </div>
          <div class="qrcode-wrap text-1-cl special-1-bg" >
            <img :src="appDownload.app_page_url" alt="" />
            <!-- 扫描二维码下载 -->
            <p class="download-options-codeText text-2-cl ">
              {{ $t("appDownLoad.headerCode") }}
            </p>
            <div class="download-options-buttons">
              <c-v6-button
                type="solid"
                width="150px"
                paddingW="0"
                height="30px"
                fontSize="12px"
                marginTop="12px"
                @click="btnLink('/appDownload')"
              >
                {{ $t("appDownLoad.more") }}
              </c-v6-button>
            </div>
          </div>
        </div>
        <!-- 设置 -->
        <div
          class="header-options_title header-setting_icon"
          v-if="colorList.length > 1"
        >
          <div @click="colorSet" class="icon-static">
            <svg
              v-if="userSkin === '2'"
              class="icon icon-18 text-1-cl"
              viewBox="0 0 1024 1024"
              v-html="getIconPath('header_skin_moon', 'text-1-cl')"
            ></svg>
            <svg
              v-else
              class="icon icon-18 text-1-cl"
              viewBox="0 0 1024 1024"
              v-html="getIconPath('header_skin_sun', 'text-1-cl')"
            ></svg>
          </div>
          <div @click="colorSet" class="icon-hover">
            <svg
              v-if="userSkin === '2'"
              class="icon icon-18 main-1-cl"
              viewBox="0 0 1024 1024"
              v-html="getIconPath('header_skin_moon', 'main-1-cl')"
            ></svg>
            <svg
              v-else
              class="icon icon-18 main-1-cl"
              viewBox="0 0 1024 1024"
              v-html="getIconPath('header_skin_sun', 'main-1-cl')"
            ></svg>
          </div>
        </div>
        <!-- 消息中心 -->
        <div
          class="header-options_title header-setting_icon header-message"
          v-if="isLogin && userInfoIsReady"
        >
          <div class="messageCount" v-if="messageCount"></div>
          <div @click="btnLink('/mesage')" class="icon-static">
            <svg
              class="icon icon-18 text-1-cl"
              viewBox="0 0 18 18"
              v-html="getIconPath('header_information', 'text-1-cl')"
            ></svg>
          </div>
          <div @click="btnLink('/mesage')" class="icon-hover">
            <svg
              class="icon icon-18 main-1-cl"
              viewBox="0 0 18 18"
              v-html="getIconPath('header_information', 'main-1-cl')"
            ></svg>
          </div>
          <div
            v-if="messageCount"
            class="header-message_info text-1-cl special-1-bg"
          >
            <ul class="header-message_list">
              <li
                class="header-message_item"
                @click="btnLink('/mesage')"
                :key="index"
                v-for="(item, index) in userMessageList"
              >
                {{ item.messageContent }}
              </li>
            </ul>
            <div
              class="header-message_more special-2-cl-h"
              @click="btnLink('/mesage')"
            >
              <!-- 查看更多 -->
              {{ $t("header.more") }}
            </div>
          </div>
        </div>
        <!-- 个人中心 -->
        <div
          class="header-options_title header-setting_icon header-message"
          :class="showDotList.length > 0 && showTaskCenter ? 'show-dot' : ''"
          v-if="isLogin && userInfoIsReady"
        >
          <div @click="btnLink('/personal/userManagement')" class="icon-static">
            <svg
              class="icon icon-18 text-1-cl"
              viewBox="0 0 18 18"
              v-html="getIconPath('header_personalcenter', 'text-1-cl')"
            ></svg>
          </div>
          <div @click="btnLink('/personal/userManagement')" class="icon-hover">
            <svg
              class="icon icon-18 main-1-cl"
              viewBox="0 0 18 18"
              v-html="getIconPath('header_personalcenter', 'main-1-cl')"
            ></svg>
          </div>
          <div class="header-message_info header-user_info text-1-cl special-1-bg">
            <ul class="header-user-text text-2-cl">
              <li class="userText text-1-cl"
                  @click="btnLink('/personal/userManagement')">{{ userText }}
              </li>
              <li  @click="copy(uid)">
                <!-- UID -->
                <span>UID:{{ uid }}</span>
                <span class="copy-uid">
                  <svg
                      class="icon_static"
                      v-html="getIconPath('copyIcon','special-4-cl')"
                      xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none"
                  >
                  </svg>
                  <svg
                      class="icon_hover"
                      v-html="getIconPath('copyIcon','main-1-cl')"
                      xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none"
                  >
                  </svg>
                </span>
              </li>
            </ul>
            <div class="link-container">
              <div class="link-item special-2-cl-h text-1-cl" @click="jump(1)">
                <svg
                    class="icon_static"
                    v-html="getIconPath('iconPerson','text-3-cl')"
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"
                >
                </svg>
                <svg
                    class="icon_hover"
                    v-html="getIconPath('iconPerson','main-1-cl')"
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"
                >
                </svg>
                <span>{{ $t('personal.navMenu.list.userManagement') }}</span>
              </div>
               <div class="link-item special-2-cl-h text-1-cl" v-if="membershipLevelOpen"  @click="goMyRates">
                <p style="display: none;"></p>
                  <svg
                      class="icon_static"
                      v-html="getIconPath('myRate','text-3-cl')"
                      xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"
                  >
                  </svg>
                  <svg
                      class="icon_hover"
                      v-html="getIconPath('myRate','main-1-cl')"
                      xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"
                  >
                  </svg>
                <span>{{$t('personal.navMenu.list.myRate') }}<!-- 我的费率 --></span>
                <span class="fill-6-bg link-item-tag" v-if="userInfo.levelName" style="display: flex;align-items: center;gap: 2px;">
                  <svg
                    class="icon icon-12"
                    v-html="getIconPath('vip', 'vip1')"
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                  ></svg>
                  <span style="font-size:12px; margin-left: 0px;">{{userInfo.levelName}}</span>
                </span>
              </div>
              <div class="link-item special-2-cl-h text-1-cl" v-if="linkurl.otcUrl" @click="jump(2)">
                  <svg
                      class="icon_static"
                      v-html="getIconPath('iconSetting','text-3-cl')"
                      xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"
                  >
                  </svg>
                  <svg
                      class="icon_hover"
                      v-html="getIconPath('iconSetting','main-1-cl')"
                      xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"
                  >
                  </svg>
                <span>{{$t('personal.navMenu.list.leaglTenderSetNew') }}</span>
              </div>
              <div v-if="showInviteFriends" class="link-item special-2-cl-h text-1-cl" @click="jump(5)">
                <svg
                    class="icon_static"
                    v-html="getIconPath('iconInviteFriends','text-3-cl')"
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"
                >
                </svg>
                <svg
                    class="icon_hover"
                    v-html="getIconPath('iconInviteFriends','main-1-cl')"
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"
                >
                </svg>
                <span>{{ $t('personal.navMenu.list.inviteFriends') }}</span>
              </div>
              <div class="link-item special-2-cl-h text-1-cl" :class="showDotList.includes('rewardCenter') && showTaskCenter ? 'show-dot' : ''" v-if="showTaskCenter" @click="jump(3)">
                  <svg
                      class="icon_static"
                      v-html="getIconPath('iconTaskCenter','text-3-cl')"
                      xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"
                  >
                  </svg>
                  <svg
                      class="icon_hover"
                      v-html="getIconPath('iconTaskCenter','main-1-cl')"
                      xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"
                  >
                  </svg>
                <span>{{ $t('personal.navMenu.list.giftCenter') }}</span>
              </div>
              <!--   子账户   -->
              <div v-if="showSubAccount" class="link-item special-2-cl-h text-1-cl" @click="jump(6)">
                <svg
                    class="icon_static"
                    v-html="getIconPath('personal_subAccount','text-3-cl')"
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1024 1024" fill="none"
                >
                </svg>
                <svg
                    class="icon_hover"
                    v-html="getIconPath('personal_subAccount','main-1-cl')"
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1024 1024" fill="none"
                >
                </svg>
                <span>{{ $t('personal.navMenu.list.subAccount') }}</span>
              </div>
              <div class="link-item special-2-cl-h text-1-cl" @click="jump(4)">
                  <svg
                      class="icon_static"
                      v-html="getIconPath('iconAPIManage','text-3-cl')"
                      xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"
                  >
                  </svg>
                  <svg
                      class="icon_hover"
                      v-html="getIconPath('iconAPIManage','main-1-cl')"
                      xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"
                  >
                  </svg>
                <span>{{ $t('personal.navMenu.list.apiManagement') }}</span>
              </div>
              <div class="link-item special-2-cl-h text-1-cl" @click="out">
                  <svg
                      class="icon_static"
                      v-html="getIconPath('iconLogout','text-3-cl')"
                      xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"
                  >
                  </svg>
                  <svg
                      class="icon_hover"
                      v-html="getIconPath('iconLogout','main-1-cl')"
                      xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"
                  >
                  </svg>
                <span>{{ $t('header.out') }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="header-language">
          <div
            class="lang-selected"
            :class="{ 'main-1-cl': navHover === 'language' }"
            @mouseover="handMouseenter('language')"
            @mouseout="handMouseleave"
          >
            {{ showLan }}
          </div>
          <!-- | {{ showCurrency }} -->
          <div class="langAndCurrency-list text-1-cl special-1-bg">
            <div class="lang-list_wrap">
              <div class="list-title text-2-cl">{{$t('header.language')}}</div>
              <vue-scroll :ops="ops" style="border-radius:0px">
                <ul class="header-lang_list">
                  <li
                    class="header-lang_item"
                    v-for="(item, index) in langArr"
                    :class="langHover === item.id ? 'special-2-bg' : ''"
                    @mouseover="langHover = item.id"
                    @mouseout="langHover = null"
                    @click="lanClick(item.id)"
                    :key="index"
                  >
                    {{ item.name }}
                    <svg
                      v-if="lan === item.id"
                      class="icon icon-14"
                      viewBox="0 0 1024 1024"
                      v-html="getIconPath('selected', 'main-1-cl')"
                    ></svg>
                  </li>
                </ul>
              </vue-scroll>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section v-else-if="headerTemplateReceived" class="int-header_wrap">
      <!-- 主流板块 -->
      <ul class="int-header-linkList">
        <!-- logo -->
        <li>
          <a class="button-logo" @click="btnHref(headerLink.home)">
            <img :src="intLogoUrl" alt="" />
          </a>
        </li>
        <li
          class="int-header-nav_item"
          v-for="(item, index) in headerList"
          :class="{ 'main-1-cl fill-3-bg': navHover === item.id }"
          :key="index"
          @click="btnHref(item.httpUrl)"
          @mouseover="navHover = item.id"
          @mouseout="navHover = null"
        >
          <img class="nav-item_icon" :src="item.logo" alt="" />
          <span class="nav-item_title">{{ item.title }}</span>
          <ul
            v-if="
              navType === '1' && item.childList && item.childList.length > 0
            "
            class="int-header-subNav_wrap text-1-cl special-1-bg"
          >
            <li
              v-for="(sub, i) in item.childList"
              :key="i"
              class="int-header-subNav_item"
              :class="{
                'special-2-bg': subNavHover === sub.id,
              }"
              @click.stop="btnHref(sub.httpUrl)"
              @mouseover="subNavHover = sub.id"
              @mouseout="subNavHover = null"
            >
              {{ sub.title }}
            </li>
          </ul>
          <ul
            v-else-if="item.childList && item.childList.length > 0"
            class="int-header-subNav_wrap text-1-cl special-1-bg int-header-subNav_wrap text-1-cl special-1-bg--b"
          >
            <li
              v-for="(sub, i) in item.childList"
              :key="i"
              class="int-header-subNav_item"
              :class="{
                'special-2-bg': subNavHover === sub.id,
              }"
              @click.stop="btnHref(sub.httpUrl)"
              @mouseover="subNavHover = sub.id"
              @mouseout="subNavHover = null"
            >
              <!-- ***** -->
              <!-- 日舰版 -->
              <img
                v-if="Dskin === '2'"
                class="logo"
                :src="sub.imageUrl"
                alt=""
              />
              <!-- 夜间版 -->
              <img
                v-else
                class="logo"
                :src="sub.logoNavDark || sub.imageUrl"
                alt=""
              />
              <!-- 角标 -->
              <dl>
                <dt class="title">
                  {{ sub.title }}
                  <span
                    v-if="sub.superscriptIconType !== 0"
                    class="sub-nav-subscript"
                  >
                    <img :src="sub.superscriptIcon" alt="" />
                  </span>
                </dt>
                <dd class="subTitle text-2-cl">{{ sub.subtitle }}</dd>
              </dl>
              <!-- ***** -->
              <span class="active-icon">
                <svg
                  class="icon icon-20"
                  viewBox="0 0 1024 1024"
                  v-html="getIconPath('go_next', 'main-1-cl')"
                ></svg>
              </span>
            </li>
          </ul>
        </li>
        <!-- 资产 -->
        <li
          v-if="isLogin && userInfoIsReady"
          class="int-header-nav_item"
          :class="
            navHover === 'assets' || router === 'assets'
              ? 'fill-3-bg main-1-cl'
              : ''
          "
          @mouseover="handMouseenter('assets')"
          @mouseleave="handMouseleave('assets')"
          @click="btnLink('/assets/exchangeAccount')"
        >
          <svg
            v-if="navHover === 'assets' || router === 'assets'"
            class="icon icon-18"
            aria-hidden="true"
          >
            <use xlink:href="#icon-b_27_1" />
          </svg>
          <svg v-else class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_27" />
          </svg>
          <span class="nav-item_title">{{ $t("header.assets") }}</span>
        </li>
        <!-- 订单 -->
        <li
          v-if="isLogin && userInfoIsReady"
          class="int-header-nav_item"
          :class="
            navHover === 'order' || router === 'order'
              ? 'fill-3-bg main-1-cl'
              : ''
          "
          @mouseover="handMouseenter('order')"
          @mouseleave="handMouseleave('order')"
          @click="btnLink('order')"
        >
          <svg
            v-if="navHover === 'order' || router === 'order'"
            class="icon icon-18"
            aria-hidden="true"
          >
            <use xlink:href="#icon-b_27_1"></use>
          </svg>
          <svg v-else class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_27"></use>
          </svg>
          <span class="nav-item_title">
            {{ $t("header.order") }}
          </span>
        </li>
        <!-- 个人中心 -->
        <li
          class="int-header-nav_item"
          :class="
            navHover === 'Account' || router === 'personal'
              ? 'fill-3-bg main-1-cl'
              : ''
          "
          @mouseover="handMouseenter('Account')"
          @mouseleave="handMouseleave('Account')"
          @click="btnLink('/personal/userManagement')"
        >
          <i class="iconClass" style="top: 19px">
            <svg
              v-if="navHover === 'Account' || router === 'personal'"
              class="icon icon-18"
              aria-hidden="true"
            >
              <use xlink:href="#icon-b_4_1" />
            </svg>
            <svg v-else class="icon icon-18" aria-hidden="true">
              <use xlink:href="#icon-b_4" />
            </svg>
          </i>
          <span class="nav-item_title">
            <!-- 用户中心 -->
            {{ $t("header.account") }}
          </span>
          <div v-if="isLogin && userInfoIsReady" class="header-message_info text-1-cl special-1-bg">
            <ul class="header-user-text">
              <li class="userText text-1-cl"
                  @click="btnLink('/personal/userManagement')">{{ userText }}
              </li>
              <li  @click="copy(uid)" >
                <!-- UID -->
                <span>UID:{{ uid }}</span>
                <span class="copy-uid">
                  <svg class="icon icon-14 icon_static" aria-hidden="true">
                  <use xlink:href="#icon-a_9"></use>
                </svg>
                <svg class="icon icon-14 icon_hover" aria-hidden="true">
                  <use xlink:href="#icon-a_9_1"></use>
                </svg>
                </span>
              </li>
            </ul>
            <div class="link-container">
              <div class="link-item special-2-cl-h" @click="jump(1)">
                <div>{{ $t('personal.navMenu.list.userManagement') }}</div>
              </div>
              <div class="link-item special-2-cl-h" v-if="linkurl.otcUrl" @click="jump(2)">
                {{ $t('personal.navMenu.list.leaglTenderSetNew') }}
              </div>
              <div class="link-item special-2-cl-h" :class="showDotList.includes('rewardCenter') && showTaskCenter ? 'show-dot' : ''" v-if="showTaskCenter" @click="jump(3)">
                {{ $t('personal.navMenu.list.giftCenter') }}
              </div>
              <div class="link-item special-2-cl-h" @click="jump(4)">
                {{ $t('personal.navMenu.list.apiManagement') }}
              </div>
              <div class="link-item special-2-cl-h" @click="out">
                {{ $t('header.out') }}
              </div>
            </div>
          </div>
        </li>
      </ul>
      <!-- 公共版款 -->
      <ul class="int-header-linkList nav-bottom">
        <!-- 消息 -->
        <li
          v-if="isLogin && userInfoIsReady"
          class="int-header-nav_item"
          :class="navHover === 'Message' ? 'fill-3-bg main-1-cl' : ''"
          @click="btnLink('/mesage')"
          @mouseover="handMouseenter('Message')"
          @mouseleave="handMouseleave('Message')"
        >
          <div class="messageCount" v-if="messageCount"></div>
          <svg class="icon icon-18 hover-hide" aria-hidden="true">
            <use xlink:href="#icon-b_3" />
          </svg>
          <svg class="icon icon-18 hover-show" aria-hidden="true">
            <use xlink:href="#icon-b_3_1" />
          </svg>
          <span class="nav-item_title">
            <!-- 消息 -->
            {{ $t("header.message") }}
          </span>
        </li>
        <!-- 设置 -->
        <li
          v-if="colorList.length > 1"
          class="int-header-nav_item"
          :class="navHover === 'Setting' ? 'fill-3-bg main-1-cl' : ''"
          @click="setAlert"
          @mouseover="handMouseenter('Setting')"
          @mouseleave="handMouseleave('Setting')"
        >
          <svg class="icon icon-18 hover-hide" aria-hidden="true">
            <use xlink:href="#icon-b_2" />
          </svg>
          <svg class="icon icon-18 hover-show" aria-hidden="true">
            <use xlink:href="#icon-b_2_1" />
          </svg>
          <span class="nav-item_title">
            <!-- 设置 -->
            {{ $t("header.set") }}
          </span>
        </li>
        <!-- 国际化 切换语言 -->
        <li
          class="int-header-nav_item showLan"
          :class="navHover === 'showLan' ? 'fill-3-bg main-1-cl' : ''"
          @mouseover="handMouseenter('showLan')"
          @mouseleave="handMouseleave('showLan')"
        >
          <div class="lang-selected">
            {{ showLan }}
            <br />
            {{ showCurrency }}
          </div>
          <div class="langAndCurrency-list text-1-cl special-1-bg">
            <div class="lang-list_wrap">
              <div class="list-title text-2-cl">{{$t('header.set')}}</div>
              <ul class="header-lang_list">
                <li
                  class="header-lang_item"
                  v-for="(item, index) in langArr"
                  :class="langHover === item.id ? 'special-2-bg' : ''"
                  @mouseover="handMouseenter(item.id)"
                  @mouseout="handMouseleave(item.id)"
                  @click="lanClick(item.id)"
                  :key="index"
                >
                  {{ item.name }}
                  <svg
                    v-if="lan === item.id"
                    class="icon icon-14"
                    viewBox="0 0 1024 1024"
                    v-html="getIconPath('selected', 'main-1-cl')"
                  ></svg>
                </li>
              </ul>
            </div>
            <div class="lang-list_wrap">
              <div class="list-title text-2-cl">Currency</div>
              <ul class="header-lang_list">
                <li
                  class="header-lang_item"
                  v-for="(item, index) in currencyList"
                  :class="langHover === item.id ? 'active main-1-cl' : ''"
                  @mouseover="currencyHover = item.lan"
                  @mouseout="currencyHover = null"
                  @click="currencyClick(item.lan)"
                  :key="index"
                >
                  {{ item.text }}
                  <svg
                    v-if="userCurrency === item.lan"
                    class="icon icon-14"
                    viewBox="0 0 1024 1024"
                    v-html="getIconPath('selected', 'main-1-cl')"
                  ></svg>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>
    </section>
    <c-dialog
      v-if="headerTemplateReceived"
      :showFlag="showFlag"
      :titleText="$t('header.set')"
      @confirm="setConfirm"
      @close="setClose"
    >
      <div class="setBox">
        <div class="setColor clearfix">
          <div class="setColor-key text-2-cl">{{ $t("header.color") }}</div>
          <ul class="setColor-value">
            <li v-for="(item, i) in colorList" :key="i">
              <c-redio
                @click="setSkin(item.skinId)"
                :value="Dskin === item.skinId"
              />
              <template v-if="item.skinName && item.skinName[lan]">
                <span @click="setSkin(item.skinId)" class="text-1-cl">{{
                  item.skinName[lan]
                }}</span>
              </template>
              <template v-else>
                <span @click="setSkin(item.skinId)" class="text-1-cl">{{
                  item.mainClor
                }}</span>
              </template>
            </li>
          </ul>
        </div>
      </div>
    </c-dialog>
  </header>
</template>
<script>
import mixin from '../../../common-mixin/modules/v5Header';
import '../../../common-mixin/modules/v5Header/index.styl';

export default {
  name: 'c-v5-header',
  mixins: [mixin],
  mounted() {
    this.modifyTilte();
    this.init();
    this.getMesssageState();
    this.getTaskCenterShow();
    this.rewardListen();
  },
  created() {
    this.setActive();
    this.setMarkActive();
  },
};
</script>

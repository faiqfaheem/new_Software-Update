import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  NativeModules,
  Image,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { scanInstalledAppsForUpdates } from '../utils/playStoreScraper';

const LAYER_35_SVG = `<svg width="26" height="26" viewBox="0 0 31 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.3399 2.23399V27.9249C22.3399 29.7679 20.832 31.2759 18.9889 31.2759H3.35099C1.50794 31.2759 0 29.7679 0 27.9249V3.35099C0 1.50794 1.50794 0 3.35099 0H20.1059C21.3346 0 22.3399 1.0053 22.3399 2.23399Z" fill="#F95A5A"/>
<path d="M22.3393 3.35099V27.9249C22.3393 29.7679 20.8313 31.2759 18.9883 31.2759H3.35037C1.84242 31.2759 0.557879 30.2706 0.166931 28.8743C0.44618 28.986 0.781278 29.0419 1.11638 29.0419H16.7543C18.5973 29.0419 20.1053 27.5339 20.1053 25.6909V1.11699C20.1053 1.11699 20.217 0.279249 20.1053 0C21.5015 0.390948 22.3393 1.84304 22.3393 3.35099Z" fill="#DB3A1E"/>
<path d="M18.9889 5.58574V23.4577C18.9889 24.072 18.4863 24.5747 17.8719 24.5747H4.46798C3.85363 24.5747 3.35098 4.46875 3.35098 23.4577V5.58574C3.35098 4.9714 3.85363 4.46875 4.46798 4.46875H17.8719C18.4863 4.46875 18.9889 4.9714 18.9889 5.58574Z" fill="white"/>
<path d="M13.4039 29.0426H8.93594V26.8086H13.4039V29.0426Z" fill="white"/>
<path d="M30.7173 8.37746V11.7284C30.7173 12.3428 30.2147 12.8454 29.6004 12.8454H27.4222L28.986 14.4092C29.2094 14.6326 29.3211 14.9119 29.3211 15.1911C29.3211 15.4704 29.2094 15.7496 28.986 15.973L26.6403 18.3187C26.1935 18.7655 25.5233 18.7655 25.0765 18.3187L23.4569 16.8108V18.9889C23.4569 19.6033 22.9542 20.1059 22.3399 20.1059H20.1059V0H22.3399C22.9542 0 23.4569 0.502648 23.4569 1.11699V3.29514L25.0207 1.73134C25.4675 1.28454 26.1377 1.28454 26.5845 1.73134L28.9302 4.07703C29.1536 4.30043 29.2653 4.57968 29.2653 4.85893C29.2653 5.13818 29.1536 5.41743 28.9302 5.64082L27.4222 7.26047H29.6004C30.2147 7.26047 30.7173 7.76311 30.7173 8.37746Z" fill="#E7D151"/>
<path d="M25.1888 12.8445L26.7526 14.4083C26.976 14.6317 27.0877 14.911 27.0877 15.1910C27.0877 15.4695 26.976 15.7487 26.7526 15.9721L24.742 18.0385L25.0771 18.3736C25.5239 18.8204 26.1941 18.8204 26.6409 18.3736L28.9866 16.028C29.21 15.8046 29.3217 15.5253 29.3217 15.2461C29.3217 14.9668 29.21 14.6876 28.9866 14.4642L27.4228 12.8445H25.1888ZM29.2659 4.91386C29.2659 4.63461 29.1542 4.35536 28.9308 4.13196L26.5851 1.78627C26.1383 1.33947 25.4681 1.33947 25.0213 1.78627L24.6862 2.12137L26.6968 4.18781C26.9202 4.41121 27.0319 4.69046 27.0319 4.96971C27.0319 5.24895 26.9202 5.5282 26.6968 5.7516L25.1888 7.25955H27.4228L28.9866 5.69575C29.1542 5.47235 29.2659 5.1931 29.2659 4.91386ZM29.601 7.25955H27.4228C28.0372 7.25955 28.484 7.76219 28.484 8.37654V11.7275C28.484 12.3419 27.9813 12.8445 27.4228 12.8445H29.601C30.2153 12.8445 30.718 12.3419 30.718 11.7275V8.37654C30.718 7.76219 30.2153 7.25955 29.601 7.25955Z" fill="#FEB12D"/>
<path d="M20.1059 6.70117V13.4031C21.9489 13.4031 23.4569 11.8952 23.4569 10.0522C23.4569 8.20912 21.9489 6.70117 20.1059 6.70117Z" fill="white"/>
<path d="M10.3883 16.4192L7.03735 13.0682L8.60115 11.5044L10.0532 12.9565V7.81836H12.2872V12.9565L13.7393 11.5044L15.3031 13.0682L11.9521 16.4192C11.7287 16.6426 11.4495 16.7543 11.1702 16.7543C10.891 16.7543 10.6117 16.6426 10.3883 16.4192ZM7.26075 20.1053H15.0797V17.8713H7.26075V20.1053Z" fill="#698CDD"/>
</svg>`;

const GROUP_SVG = `<svg width="26" height="26" viewBox="0 0 35 39" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M33.1597 19.4238C33.9508 18.605 34.4391 17.4917 34.4391 16.2659C34.4391 14.3746 32.9004 12.8359 31.0091 12.8359H27.9893V32.4691H29.8902C32.3985 32.4691 34.4391 30.4285 34.4391 27.9202C34.4391 26.8428 33.9392 25.8803 33.1597 25.2509C33.9508 24.4321 34.4391 23.3188 34.4391 22.0931C34.4391 21.0156 33.9392 20.0531 33.1597 19.4238Z" fill="#FEAE47"/>
<path d="M9.87752 21.8989V12.5532C9.87752 10.3237 8.06363 8.50977 5.83407 8.50977C3.60452 8.50977 1.7907 10.3237 1.7907 12.5532V20.347L1.23776 21.7293C-0.516305 26.1145 -0.401482 31.0956 1.553 35.3954L2.99672 38.5717H11.7611L9.87752 21.8989Z" fill="#FECA85"/>
<path d="M18.6944 33.2254L29.7699 32.4719V5.6246L18.6944 4.87109L17.9409 18.2766L18.6944 33.2254Z" fill="#EBE1DC"/>
<path d="M7.6189 32.4719L18.6943 33.2254V4.87109L7.6189 5.6246V32.4719Z" fill="#F8F1EF"/>
<path d="M18.6944 38.5755H25.626C27.9109 38.5755 29.7699 36.7165 29.7699 34.4316V32.4727H18.6944L17.9409 35.5241L18.6944 38.5755Z" fill="#3D3D3D"/>
<path d="M7.6189 32.4727V34.4316C7.6189 36.7165 9.47784 38.5755 11.7628 38.5755H18.6943V32.4727H7.6189Z" fill="#535353"/>
<path d="M25.626 0H18.6944L17.9409 2.81279L18.6944 5.62558H29.7699V4.14388C29.7699 1.85894 27.9109 0 25.626 0Z" fill="#3D3D3D"/>
<path d="M7.6189 4.14388V5.62565H18.6943V0H11.7628C9.47784 0 7.6189 1.85894 7.6189 4.14388Z" fill="#535353"/>
<path d="M14.984 17.1572H12.7237V12.625H17.256V14.8853H14.984V17.1572Z" fill="#FDCB02"/>
<path d="M17.256 24.5635H12.7238V20.0312H14.9841V22.3032H17.256V24.5635Z" fill="#FDCB02"/>
<path d="M24.6609 24.5635H20.1286V22.3032H22.4006V20.0312H24.6609V24.5635Z" fill="#FDAE02"/>
<path d="M24.6609 17.1572H22.4006V14.8853H20.1286V12.625H24.6609V17.1572Z" fill="#FDAE02"/>
</svg>`;

const UPDATE_SVG = `<svg width="26" height="26" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M25.9239 13.6833V37.6023C25.9239 39.4388 24.4209 40.9392 22.5844 40.9392H8.94781C7.11132 40.9392 5.60828 39.4388 5.60828 37.6023V13.6833C5.60828 11.8468 7.11132 10.3438 8.94781 10.3438H22.5844C24.4209 10.3429 25.9239 11.8459 25.9239 13.6833Z" fill="#00B2CA"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M25.9239 13.6833V25.4249C20.2039 24.9162 15.7197 20.114 15.7197 14.2634C15.7197 12.8849 15.9681 11.5641 16.4235 10.3438H22.5844C24.4209 10.3429 25.9239 11.8459 25.9239 13.6833Z" fill="#00A5BB"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M25.9239 36.0723V37.602C25.9239 39.4384 24.4209 40.9389 22.5844 40.9389H8.94781C7.11132 40.9389 5.60828 39.4384 5.60828 37.602V36.0723H25.9239Z" fill="#1A3D6D"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M20.3405 10.3418V11.4478C20.3405 12.7781 19.2517 13.8644 17.924 13.8644H13.6073C12.277 13.8644 11.1882 12.7781 11.1882 11.4478V10.3418H20.3405Z" fill="#114778"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M20.3405 10.3418V11.4478C20.3405 12.7781 19.2517 13.8644 17.924 13.8644H15.7266C15.7704 12.6295 16.0119 11.4452 16.4235 10.3418H20.3405Z" fill="#17354F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.95609 16.0273H23.5761V33.5689H7.95609V16.0273Z" fill="#8FCAE5"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.858 16.0273H23.5752V24.958C19.5688 23.7033 16.5283 20.2589 15.858 16.0273Z" fill="#73AFCF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M27.934 24.6784C34.1043 24.6784 39.1376 19.6459 39.1376 13.473C39.1376 7.30266 34.1051 2.26758 27.934 2.26758C21.7611 2.26758 16.7286 7.30266 16.7286 13.473C16.7277 19.6459 21.7611 24.6784 27.934 24.6784Z" fill="#FFCD05"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M25.6609 8.9781C25.3103 9.11903 24.9107 8.9463 24.7689 8.59568C24.628 8.24505 24.7981 7.84544 25.1513 7.7045C26.4739 7.17599 27.9237 7.05138 29.3072 7.33669C30.6522 7.61169 31.9309 8.26997 32.9682 9.30724C34.0063 10.3471 34.6637 11.6267 34.9413 12.9708C35.212 14.2933 35.1097 15.6795 34.6371 16.9583L35.4312 17.7472C35.6993 18.0153 35.7019 18.4484 35.4337 18.7165C35.3074 18.8454 35.1415 18.9116 34.9731 18.9185L32.7121 19.0208C32.3322 19.0379 32.0126 18.7458 31.9962 18.3651C31.9962 18.341 31.9962 18.3186 31.9988 18.2946L32.089 16.0439C32.1037 15.6666 32.4225 15.3718 32.8006 15.3865C32.9785 15.3933 33.1392 15.4672 33.2561 15.5841L33.5414 15.8668C33.7579 15.0092 33.7751 11.1103 33.5972 13.2432C33.3755 12.1595 32.8419 11.124 31.9971 10.2783C31.1523 9.43271 30.1168 8.89989 29.0322 8.67818C27.9116 8.447 26.7351 8.54669 25.6609 8.9781ZM23.693 10.5662L23.6027 12.8169C23.5881 13.1968 23.2693 13.4915 22.8886 13.4769C22.7107 13.4701 22.55 13.3944 22.4331 13.2776L22.1478 12.9948C21.9338 13.8551 21.914 14.754 22.0919 15.6185C22.3137 16.7022 22.8473 17.7377 23.6921 18.5833C24.6082 19.4994 25.746 20.0477 26.9268 20.2351C28.1419 20.425 29.4087 20.2325 30.5276 19.6601C30.8636 19.4874 31.2778 19.6215 31.448 19.9575C31.6207 20.2935 31.4866 20.7051 31.1506 20.8779C29.7722 21.5868 28.2124 21.8232 26.7171 21.5868C25.251 21.3583 23.8451 20.6811 22.7193 19.5553C21.6812 18.5172 21.0237 17.2384 20.7487 15.8943C20.4763 14.5692 20.5786 13.1856 21.053 11.9068L20.2563 11.1154C19.9882 10.8498 19.9856 10.4141 20.2537 10.146C20.3826 10.0171 20.5485 9.95091 20.7169 9.94403L22.978 9.84177C23.3552 9.82458 23.6749 10.1193 23.6921 10.4975C23.693 10.5198 23.693 10.5447 23.693 10.5662Z" fill="#D8AF28"/>
<path d="M25.7486 8.01872C25.398 8.15966 24.9984 7.9895 24.8566 7.63887C24.7148 7.28825 24.8858 6.88864 25.239 6.74684C26.5616 6.21575 28.0113 6.09372 29.3949 6.37645C30.7373 6.65403 32.0186 7.31231 33.0559 8.34958C34.094 9.3877 34.7514 10.6665 35.0264 12.0105C35.3117 13.3941 35.1871 14.8439 34.6586 16.1665C34.5177 16.5197 34.1181 16.6898 33.7666 16.5489C33.4151 16.4079 33.2449 16.0083 33.3841 15.6568C33.8156 14.5826 33.9152 13.4061 33.6841 12.2855C33.4623 11.2018 32.9287 10.1663 32.0839 9.32067C31.2391 8.47505 30.2036 7.94223 29.1191 7.72052C27.9993 7.4902 26.8228 7.58989 25.7486 8.01872ZM30.6161 18.7008C30.9521 18.5306 31.3663 18.6621 31.5365 19.0007C31.7092 19.3367 31.5752 19.7483 31.2391 19.9211C29.8607 20.6275 28.3009 20.8638 26.8031 20.63C25.3387 20.3989 23.9336 19.7217 22.8078 18.5985C21.7697 17.5586 21.1123 16.279 20.8373 14.935C20.552 13.554 20.6766 12.1042 21.2051 10.779C21.346 10.4284 21.7456 10.2574 22.0963 10.3992C22.4469 10.5401 22.6179 10.9397 22.4787 11.2912C22.0473 12.3654 21.9476 13.5419 22.1788 14.6625C22.4005 15.7462 22.9341 16.7818 23.7789 17.6274C24.695 18.5409 25.8328 19.0918 27.0119 19.2765C28.2313 19.4682 29.4981 19.2757 30.6161 18.7008Z" fill="#902E57"/>
<path d="M23.778 9.60971L23.6878 11.8604C23.6732 12.2377 23.3569 12.5324 22.9762 12.5178C22.7984 12.5101 22.6377 12.437 22.5208 12.3202L20.3457 10.1571C20.0776 9.889 20.075 9.45588 20.3431 9.18775C20.4694 9.05885 20.6379 8.9901 20.8037 8.9858L23.0648 8.88353C23.4446 8.86635 23.7643 9.15853 23.7806 9.53924C23.7806 9.56072 23.7806 9.58564 23.778 9.60971ZM32.0873 17.3398L32.1776 15.0891C32.1922 14.7092 32.5084 14.4145 32.8891 14.4291C33.067 14.436 33.2277 14.5116 33.3446 14.6285L35.5197 16.7915C35.7878 17.057 35.7904 17.4928 35.5223 17.7609C35.3959 17.8898 35.2301 17.956 35.0616 17.9628L32.8006 18.0651C32.4208 18.0823 32.1011 17.7875 32.0848 17.4094C32.0848 17.3853 32.0848 17.3613 32.0873 17.3398Z" fill="#902E57"/>
<path d="M10.6966 20.5784C10.3168 20.5784 10.0074 20.2716 10.0074 19.8917C10.0074 19.5119 10.3168 19.2051 10.6966 19.2051H13.2232C13.603 19.2051 13.9098 19.5119 13.9098 19.8917C13.9098 20.2716 13.603 20.5784 13.2232 20.5784H10.6966ZM13.4441 30.5609C13.0642 30.5609 12.7574 30.2515 12.7574 29.8742C12.7574 29.4944 13.0642 29.185 13.4441 29.185H20.3603C20.7402 29.185 21.0495 29.4944 21.0495 29.8742C21.0495 30.2515 20.7402 30.5609 20.3603 30.5609H13.4441ZM10.6966 27.2334C10.3168 27.2334 10.0074 26.9266 10.0074 26.5467C10.0074 26.1669 10.3168 25.8575 10.6966 25.8575H15.993C16.3728 25.8575 16.6796 26.1669 16.6796 26.5467C16.6796 26.9266 16.3728 27.2334 15.993 27.2334H10.6966ZM14.5166 23.9059C14.1393 23.9059 13.8299 23.5991 13.8299 23.2192C13.8299 22.8394 14.1393 22.5326 14.5166 22.5326H17.0448C17.4247 22.5326 17.7315 22.8394 17.7315 23.2192C17.7315 23.5991 17.4247 23.9059 17.0448 23.9059H14.5166Z" fill="white"/>
</svg>`;

const SETTINGS_SVG = `<svg width="22" height="22" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.3 20L6.9 16.8C6.68333 16.7167 6.47917 16.6167 6.2875 16.5C6.09583 16.3833 5.90833 16.2583 5.725 16.125L2.75 17.375L0 12.625L2.575 10.675C2.55833 10.5583 2.55 10.4458 2.55 10.3375C2.55 10.2292 2.55 10.1167 2.55 10C2.55 9.88333 2.55 9.77083 2.55 9.6625C2.55 9.55417 2.55833 9.44167 2.575 9.325L0 7.375L2.75 2.625L5.725 3.875C5.90833 3.74167 6.1 3.61667 6.3 3.5C6.5 3.38333 6.7 3.28333 6.9 3.2L7.3 0H12.8L13.2 3.2C13.4167 3.28333 13.6208 3.38333 13.8125 3.5C14.0042 3.61667 14.1917 3.74167 14.375 3.875L17.35 2.625L20.1 7.375L17.525 9.325C17.5417 9.44167 17.55 9.55417 17.55 9.6625C17.55 9.77083 17.55 9.88333 17.55 10C17.55 10.1167 17.55 10.2292 17.55 10.3375C17.55 10.4458 17.5333 10.5583 17.5 10.675L20.075 12.625L17.325 17.375L14.375 16.125C14.1917 16.2583 14 16.3833 13.8 16.5C13.6 16.6167 13.4 16.7167 13.2 16.8L12.8 20H7.3ZM9.05 18H11.025L11.375 15.35C11.8917 15.2167 12.3708 15.0208 12.8125 14.7625C13.2542 14.5042 13.6583 14.1917 14.025 13.825L16.5 14.85L17.475 13.15L15.325 11.525C15.4083 11.2917 15.4667 11.0458 15.5 10.7875C15.5333 10.5292 15.55 10.2667 15.55 10C15.55 9.73333 15.5333 9.47083 15.5 9.2125C15.4667 8.95417 15.4083 8.70833 15.325 8.475L17.475 6.85L16.5 5.15L14.025 6.2C13.6583 5.81667 13.2542 5.49583 12.8125 5.2375C12.3708 4.97917 11.8917 4.78333 11.375 4.65L11.05 2H9.075L8.725 4.65C8.20833 4.78333 7.72917 4.97917 7.2875 5.2375C6.84583 5.49583 6.44167 5.80833 6.075 6.175L3.6 5.15L2.625 6.85L4.775 8.45C4.69167 8.7 4.63333 8.95 4.6 9.2C4.56667 9.45 4.55 9.71667 4.55 10C4.55 10.2667 4.56667 10.525 4.6 10.775C4.63333 11.025 4.69167 11.275 4.775 11.525L2.625 13.15L3.6 14.85L6.075 13.8C6.44167 14.1833 6.84583 14.5042 7.2875 14.7625C7.72917 15.0208 8.20833 15.2167 8.725 15.35L9.05 18ZM10.1 13.5C11.0667 13.5 11.8917 13.1583 12.575 12.475C13.2583 11.7917 13.6 10.9667 13.6 10C13.6 9.03333 13.2583 8.20833 12.575 7.525C11.8917 6.84167 11.0667 6.5 10.1 6.5C9.11667 6.5 8.2875 6.84167 7.6125 7.525C6.9375 8.20833 6.6 9.03333 6.6 10C6.6 10.9667 6.9375 11.7917 7.6125 12.475C8.2875 13.1583 9.11667 13.5 10.1 13.5Z" fill="#DAE2FD"/>
</svg>`;

const SETTINGS_ICON = require('../assets/settings_icon.png');

const WhitePlaceholder = ({ size = 22, borderRadius = 4, color = '#FFFFFF', opacity = 1 }) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: borderRadius,
      opacity: opacity,
    }}
  />
);

const BACK_ARROW_ICON = require('../assets/back_arrow_icon.png');

const BackArrow = ({ size = 20 }) => (
  <Image source={BACK_ARROW_ICON} style={{ width: size, height: size }} resizeMode="contain" />
);

const ScanAppsScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(true);

  // Realtime App Counts & Update Candidate List
  const [installedAppsCount, setInstalledAppsCount] = useState('0');
  const [systemAppsCount, setSystemAppsCount] = useState('0');
  const [availableUpdatesCount, setAvailableUpdatesCount] = useState('0');
  const [candidateUpdateAppsList, setCandidateUpdateAppsList] = useState([]);

  useEffect(() => {
    startRealtimeAppScan();
  }, []);

  const isUserFacingSystemApp = (app) => {
    if (!app || !app.isSystemApp) return true;

    const name = (app.appName || app.name || '').trim();
    const pkg = (app.packageName || '').trim().toLowerCase();

    if (!name || name.toLowerCase() === pkg) return false;

    const lowerName = name.toLowerCase();

    if (
      lowerName.startsWith('com.') ||
      lowerName.startsWith('org.') ||
      lowerName.startsWith('net.') ||
      lowerName.startsWith('android.') ||
      lowerName.startsWith('sys.') ||
      lowerName.startsWith('io.') ||
      lowerName.includes('.')
    ) {
      return false;
    }

    const OS_BACKGROUND_KEYWORDS = [
      'provider',
      'service',
      'services',
      'system',
      'framework',
      'installer',
      'spooler',
      'carrier',
      'companion',
      'dictionary',
      'overlay',
      'stub',
      'proxy',
      'captive',
      'fused',
      'storage',
      'telephony',
      'keychain',
      'feedback',
      'agent',
      'daemon',
      'engine',
      'component',
      'shell',
      'interface',
      'extension',
      'plugin',
      'helper',
      'wallpaper',
      'carousel',
      'analytics',
      'msa',
      'security core',
      'guard',
      'intent',
      'permission',
      'print',
      'bluetooth',
      'sim',
      'manager',
      'module',
      'handler',
    ];

    const PRIMARY_SYSTEM_NAMES = [
      'settings',
      'camera',
      'gallery',
      'photos',
      'phone',
      'dialer',
      'messages',
      'messaging',
      'contacts',
      'clock',
      'alarm',
      'calculator',
      'calendar',
      'files',
      'file manager',
      'my files',
      'chrome',
      'google',
      'youtube',
      'maps',
      'gmail',
      'drive',
      'play store',
      'notes',
      'keep',
      'voice recorder',
      'recorder',
      'compass',
      'weather',
      'radio',
      'fm radio',
      'music',
      'video',
      'browser',
      'screen recorder',
      'gboard',
      'duo',
      'meet',
    ];

    const isPrimaryName = PRIMARY_SYSTEM_NAMES.some((pName) => lowerName.includes(pName));
    if (isPrimaryName) return true;

    const isBackgroundKeyword = OS_BACKGROUND_KEYWORDS.some((kw) => lowerName.includes(kw));
    if (isBackgroundKeyword) return false;

    if (name.length > 30) return false;
    return true;
  };

  const startRealtimeAppScan = async () => {
    setProgress(0);
    setIsScanning(true);

    let installedCount = 0;
    let systemCount = 0;
    let updatesCount = 0;
    let finalUpdateApps = [];

    try {
      if (
        NativeModules.AppPermissionModule &&
        NativeModules.AppPermissionModule.getInstalledAppsPermissions
      ) {
        const rawApps = await NativeModules.AppPermissionModule.getInstalledAppsPermissions();
        if (Array.isArray(rawApps) && rawApps.length > 0) {
          const scanResults = await scanInstalledAppsForUpdates(rawApps, (scanned, total) => {
            if (total > 0) {
              const currentPct = Math.min(Math.round((scanned / total) * 100), 99);
              setProgress(currentPct);
            }
          });

          installedCount = scanResults.installedCount;
          systemCount = scanResults.systemCount;
          finalUpdateApps = scanResults.availableUpdates;
          updatesCount = scanResults.availableUpdates.length;
        }
      }
    } catch (e) {
      console.warn('Realtime app scan error:', e);
    }

    setProgress(100);
    setIsScanning(false);
    setInstalledAppsCount(String(installedCount || 0));
    setSystemAppsCount(String(systemCount || 0));
    setAvailableUpdatesCount(String(updatesCount || 0));
    setCandidateUpdateAppsList(finalUpdateApps);
  };


  const handleBulkUpdate = () => {
    navigation.navigate('AvailableUpdatesScreen', {
      updateApps: candidateUpdateAppsList,
    });
  };

  const handleSettingsPress = () => {
    navigation.navigate('SettingsScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <BackArrow size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Apps</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <SvgXml xml={SETTINGS_SVG} width={22} height={22} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Progress Circle Card */}
        <View style={styles.progressCard}>
          <View style={styles.circleOuterRing}>
            <View style={styles.circleInnerContainer}>
              <Text style={styles.percentageText}>{progress}%</Text>
            </View>
          </View>

          <Text style={styles.scanStatusText}>
            {isScanning ? 'Scanning Installed & System Packages...' : 'Realtime Scan Completed'}
          </Text>
        </View>

        {/* Installed Apps Card */}
        <TouchableOpacity
          style={styles.statRowCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('AllAppsScreen', { filter: 'Installed' })}
        >
          <View style={[styles.iconSquare, { backgroundColor: '#2B3E62' }]}>
            <SvgXml xml={LAYER_35_SVG} width={26} height={26} />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statCardTitle}>Installed Apps</Text>
            <Text style={styles.statCardSubText}>User Downloaded Packages</Text>
          </View>
          <Text style={styles.statCardCount}>{installedAppsCount}</Text>
        </TouchableOpacity>

        {/* System Apps Card */}
        <TouchableOpacity
          style={styles.statRowCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('AllAppsScreen', { filter: 'System' })}
        >
          <View style={[styles.iconSquare, { backgroundColor: '#622B2B' }]}>
            <SvgXml xml={GROUP_SVG} width={26} height={26} />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statCardTitle}>System Apps</Text>
            <Text style={styles.statCardSubText}>OS Pre-Installed Packages</Text>
          </View>
          <Text style={styles.statCardCount}>{systemAppsCount}</Text>
        </TouchableOpacity>

        {/* Available Updates Card */}
        <TouchableOpacity
          style={styles.statRowCard}
          activeOpacity={0.7}
          onPress={handleBulkUpdate}
        >
          <View style={[styles.iconSquare, { backgroundColor: '#166534' }]}>
            <SvgXml xml={UPDATE_SVG} width={26} height={26} />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statCardTitle}>Available Updates</Text>
            <Text style={styles.statCardSubText}>Pending App Update Candidates</Text>
          </View>
          <Text style={[styles.statCardCount, { color: '#4ADE80' }]}>
            {availableUpdatesCount}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Action Button (Visible when Scan Completed) */}
      {!isScanning && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.bulkUpdateButton} onPress={handleBulkUpdate}>
            <Text style={styles.bulkButtonText}>
              View Available Updates ({availableUpdatesCount})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0B1120',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 6,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Gilroy-Bold',
    fontWeight: 'bold',
    color: '#DAE2FD',
    letterSpacing: 0.3,
  },
  settingsButton: {
    padding: 6,
  },
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90,
  },
  progressCard: {
    backgroundColor: '#131C31',
    borderRadius: 18,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  circleOuterRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 12,
    borderColor: '#ADC6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  circleInnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ADC6FF',
  },
  scanStatusText: {
    fontSize: 14,
    color: '#ADC6FF',
    fontWeight: '600',
  },
  statRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  iconSquare: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statTextGroup: {
    flex: 1,
  },
  statCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DAE2FD',
    marginBottom: 2,
  },
  statCardSubText: {
    fontSize: 12,
    color: '#64748B',
  },
  statCardCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1120',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  bulkUpdateButton: {
    backgroundColor: '#ADC6FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    // Drop shadow effect
    shadowColor: '#ADC6FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  bulkButtonText: {
    color: '#0B1120',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScanAppsScreen;

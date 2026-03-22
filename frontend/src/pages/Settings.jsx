import { useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../api/index.js';
import { useToast } from '../hooks/useToast.jsx';
import CustomSelect from '../components/CustomSelect.jsx';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const ICONS = {
  general: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  ride: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="3" y="11" width="18" height="8" rx="2"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/><path d="M15 11 13 6H9L7 11"/></svg>`,
  referral: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>`,
  payment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
  legal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  push: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
  mobile_otp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`,
  otp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  app_config: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
};

const TABS = [
  { k:'general',    label:'General',         desc:'App name, branding, theme colors' },
  { k:'ride',       label:'Ride Config',     desc:'Day/night rates, surge, cancellation' },
  { k:'referral',   label:'Referral',        desc:'Referral bonuses and rules' },
  { k:'payment',    label:'Payment',         desc:'Gateways, commission, payouts' },
  { k:'legal',      label:'Legal',           desc:'Company info, policy URLs' },
  { k:'push',       label:'Push Notif.',     desc:'FCM, APNs configuration' },
  { k:'mail',       label:'Mail / OTP',      desc:'SMTP and email templates' },
  { k:'mobile_otp', label:'Mobile OTP',      desc:'Twilio, MSG91, SMS templates' },
  { k:'otp',        label:'OTP Config',      desc:'Digits, expiry, attempts, blocking' },
  { k:'app_config', label:'App Config',      desc:'Mobile app colors, versions, store links' },
];

const FIELDS = {
  general:[
    {k:'app_name',t:'text',l:'App Name',desc:'Displayed across the platform'},
    {k:'tagline',t:'text',l:'Tagline',desc:'Short tagline shown on splash'},
    {k:'support_email',t:'email',l:'Support Email',desc:'Customer support email'},
    {k:'support_phone',t:'text',l:'Support Phone',desc:'Helpline number'},
    {k:'currency',t:'select',opts:['INR','USD','EUR','GBP','AED'],l:'Currency',desc:'Default currency'},
    {k:'timezone',t:'select',opts:['Asia/Kolkata','UTC','America/New_York','Europe/London','Asia/Dubai'],l:'Timezone',desc:'Platform timezone'},
    {k:'date_format',t:'select',opts:['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'],l:'Date Format',desc:'Date display format'},
    {k:'country',t:'text',l:'Country',desc:'Operating country'},
    {k:'primary_color',t:'color',l:'Primary Color',desc:'Main brand color (buttons, highlights)'},
    {k:'secondary_color',t:'color',l:'Secondary Color',desc:'Sidebar / dark background color'},
    {k:'accent_color',t:'color',l:'Accent Color',desc:'Success / active color'},
    {k:'logo_url',t:'text',l:'Logo URL',desc:'Full URL to app logo image'},
    {k:'favicon_url',t:'text',l:'Favicon URL',desc:'URL to favicon .ico'},
    {k:'maintenance_mode',t:'bool',l:'Maintenance Mode',desc:'Disable app for users while you update'},
    {k:'demo_mode',t:'bool',l:'Demo Mode',desc:'Enable demo data for testing'},
  ],
  ride:[
    {k:'day_start',t:'time',l:'Day Start Time',desc:'Beginning of day-rate window'},
    {k:'day_end',t:'time',l:'Day End Time',desc:'End of day-rate window'},
    {k:'night_charge_enabled',t:'bool',l:'Night Charge',desc:'Apply surcharge outside day window'},
    {k:'night_surcharge_pct',t:'number',l:'Night Surcharge (%)',desc:'Extra % added to fare at night'},
    {k:'surge_enabled',t:'bool',l:'Surge Pricing',desc:'Auto-activate surge during high demand'},
    {k:'surge_multiplier',t:'number',l:'Surge Multiplier',desc:'Fare multiplier during surge (e.g. 1.5)'},
    {k:'surge_threshold',t:'number',l:'Surge Threshold (%)',desc:'Driver occupancy % that triggers surge'},
    {k:'cancel_window_mins',t:'number',l:'Free Cancel Window (mins)',desc:'Minutes after booking before fee applies'},
    {k:'cancel_fee',t:'number',l:'Cancellation Fee (₹)',desc:'Fee charged after free window expires'},
    {k:'auto_assign',t:'bool',l:'Auto Assign Driver',desc:'Automatically assign nearest available driver'},
    {k:'assign_timeout_secs',t:'number',l:'Assign Timeout (secs)',desc:'Seconds before trying next driver'},
    {k:'max_driver_distance_km',t:'number',l:'Max Driver Distance (km)',desc:'Max km radius to search for drivers'},
    {k:'ride_otp_enabled',t:'bool',l:'Ride Start OTP',desc:'Driver must enter OTP to start ride'},
    {k:'rating_enabled',t:'bool',l:'Ratings Enabled',desc:'Allow customers to rate drivers'},
    {k:'sos_enabled',t:'bool',l:'SOS Enabled',desc:'Enable emergency SOS button in app'},
  ],
  referral:[
    {k:'referral_enabled',t:'bool',l:'Referral Program',desc:'Enable/disable the referral system'},
    {k:'referral_code_prefix',t:'text',l:'Code Prefix',desc:'Prefix for generated referral codes'},
    {k:'referral_link_template',t:'text',l:'Referral Link Template',desc:'Use {code} as placeholder'},
    {k:'referrer_bonus',t:'number',l:'Referrer Bonus (₹)',desc:'Wallet credit given to the referrer'},
    {k:'referee_bonus',t:'number',l:'Referee Bonus (₹)',desc:'Wallet credit given to the new user'},
    {k:'bonus_credit_after_rides',t:'number',l:'Credit After Rides',desc:'Rides new user must complete before bonus is credited'},
    {k:'min_rides_to_earn',t:'number',l:'Min Rides to Earn',desc:'Referrer earns only after this many rides'},
    {k:'max_referrals_per_user',t:'number',l:'Max Referrals / User',desc:'Cap on referrals a single user can make'},
    {k:'referral_expiry_days',t:'number',l:'Referral Expiry (days)',desc:'Days before unused referral link expires'},
  ],
  payment:[
    {k:'commission_rate',t:'number',l:'Commission Rate (%)',desc:'Platform cut from each ride'},
    {k:'commission_type',t:'select',opts:['percentage','flat'],l:'Commission Type',desc:'How commission is calculated'},
    {k:'gateway_primary',t:'select',opts:['razorpay','stripe','paytm','ccavenue'],l:'Primary Gateway',desc:'Main payment processor'},
    {k:'razorpay_key_id',t:'text',l:'Razorpay Key ID',desc:'Live/Test key ID from Razorpay dashboard'},
    {k:'razorpay_key_secret',t:'password',l:'Razorpay Key Secret',desc:'Keep this secret!'},
    {k:'stripe_pub_key',t:'text',l:'Stripe Publishable Key',desc:'Stripe pk_ key'},
    {k:'stripe_secret_key',t:'password',l:'Stripe Secret Key',desc:'Stripe sk_ key'},
    {k:'auto_payout',t:'bool',l:'Auto Payout',desc:'Automatically pay drivers on schedule'},
    {k:'payout_schedule',t:'select',opts:['daily','weekly','biweekly','monthly'],l:'Payout Schedule',desc:'How often payouts are processed'},
    {k:'payout_day',t:'select',opts:['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],l:'Payout Day',desc:'Day of week for weekly payouts'},
    {k:'payout_min_amount',t:'number',l:'Min Payout Amount (₹)',desc:'Minimum wallet balance required for payout'},
    {k:'cod_enabled',t:'bool',l:'Cash on Delivery',desc:'Allow cash payments'},
    {k:'wallet_enabled',t:'bool',l:'Wallet Payments',desc:'Allow in-app wallet payments'},
    {k:'upi_enabled',t:'bool',l:'UPI Payments',desc:'Allow UPI payments'},
    {k:'card_enabled',t:'bool',l:'Card Payments',desc:'Allow debit/credit card payments'},
    {k:'gst_enabled',t:'bool',l:'GST Enabled',desc:'Apply GST to rides'},
    {k:'gst_percentage',t:'number',l:'GST Percentage (%)',desc:'GST rate applicable'},
  ],
  legal:[
    {k:'company_name',t:'text',l:'Company Name',desc:'Legal company name'},
    {k:'company_address',t:'textarea',l:'Registered Address',desc:'Full registered office address'},
    {k:'gst_number',t:'text',l:'GST Number',desc:'Goods and Services Tax registration number'},
    {k:'cin_number',t:'text',l:'CIN Number',desc:'Company Identification Number'},
    {k:'terms_url',t:'text',l:'Terms and Conditions URL',desc:'Link to T&C page'},
    {k:'privacy_url',t:'text',l:'Privacy Policy URL',desc:'Link to privacy policy'},
    {k:'cancellation_policy',t:'text',l:'Cancellation Policy URL',desc:'Link to cancellation policy'},
    {k:'refund_policy',t:'text',l:'Refund Policy URL',desc:'Link to refund policy'},
    {k:'about_url',t:'text',l:'About Us URL',desc:'Link to about us page'},
  ],
  push:[
    {k:'push_enabled',t:'bool',l:'Enable Push Notifications',desc:'Master toggle for all push notifications',group:'General'},
    {k:'firebase_project_id',t:'text',l:'Firebase Project ID',desc:'Shared project ID across Web, Android, iOS',group:'General'},
    {k:'firebase_client_email',t:'email',l:'Firebase Client Email',desc:'Service Account Email for Backend Admin SDK',group:'General'},
    {k:'firebase_private_key',t:'textarea',l:'Firebase Private Key',desc:'Service Account Private Key (BEGIN PRIVATE KEY...) for Backend Admin SDK',group:'General'},
    {k:'push_on_booking',t:'bool',l:'On Booking Confirmed',desc:'Notify when booking is confirmed',group:'General'},
    {k:'push_on_driver_assign',t:'bool',l:'On Driver Assigned',desc:'Notify when driver is assigned',group:'General'},
    {k:'push_on_trip_complete',t:'bool',l:'On Trip Complete',desc:'Notify when trip ends',group:'General'},
    {k:'push_on_payment',t:'bool',l:'On Payment',desc:'Notify on successful payment',group:'General'},
    {k:'push_on_promo',t:'bool',l:'On Promo / Offer',desc:'Notify for promotional messages',group:'General'},

    {k:'firebase_web_enabled',t:'bool',l:'Enable Web Push',desc:'Send notifications to Web application interface',group:'Web'},
    {k:'firebase_web_api_key',t:'text',l:'Web - API Key',desc:'Firebase API Key for frontend Web client initialization',group:'Web'},
    {k:'firebase_web_app_id',t:'text',l:'Web - App ID',desc:'Firebase Web App identifier',group:'Web'},
    {k:'firebase_web_vapid_key',t:'text',l:'Web - VAPID Key',desc:'Web Push voluntary application server identification key',group:'Web'},

    {k:'firebase_android_enabled',t:'bool',l:'Enable Android Push',desc:'Send notifications to Android mobile app via FCM',group:'Android'},
    {k:'firebase_android_app_id',t:'text',l:'Android - App ID',desc:'Firebase App Identifier for the Android app',group:'Android'},

    {k:'firebase_ios_enabled',t:'bool',l:'Enable iOS Push (APNs via FCM)',desc:'Send notifications to iOS app by delegating APNs to Firebase',group:'iOS'},
    {k:'firebase_ios_app_id',t:'text',l:'iOS - App ID',desc:'Firebase App Identifier for the iOS Apple app',group:'iOS'},
  ],
  mail:[
    {k:'mail_enabled',t:'bool',l:'Email Enabled',desc:'Master toggle for all email sending'},
    {k:'smtp_host',t:'text',l:'SMTP Host',desc:'e.g. smtp.gmail.com'},
    {k:'smtp_port',t:'number',l:'SMTP Port',desc:'Usually 587 (TLS) or 465 (SSL)'},
    {k:'smtp_secure',t:'bool',l:'SMTP Secure (TLS)',desc:'Use TLS/SSL for SMTP connection'},
    {k:'smtp_user',t:'text',l:'SMTP Username',desc:'Email account username'},
    {k:'smtp_pass',t:'password',l:'SMTP Password',desc:'Email account password'},
    {k:'from_name',t:'text',l:'From Name',desc:'Sender display name'},
    {k:'from_email',t:'email',l:'From Email',desc:'Sender email address'},
    {k:'otp_subject',t:'text',l:'OTP Email Subject',desc:'Subject line for OTP emails'},
    {k:'otp_template',t:'textarea',l:'OTP Email Template',desc:'Use {otp} and {expiry} as placeholders'},
    {k:'welcome_enabled',t:'bool',l:'Welcome Email',desc:'Send welcome email on registration'},
    {k:'booking_confirm_enabled',t:'bool',l:'Booking Confirmation Email',desc:'Email on booking confirmation'},
  ],
  mobile_otp:[
    {k:'sms_enabled',t:'bool',l:'SMS Enabled',desc:'Master toggle for SMS sending'},
    {k:'sms_provider',t:'select',opts:['twilio','msg91','aws_sns','nexmo','textlocal'],l:'SMS Provider',desc:'Which SMS gateway to use'},
    {k:'twilio_sid',t:'text',l:'Twilio Account SID',desc:'From Twilio console'},
    {k:'twilio_token',t:'password',l:'Twilio Auth Token',desc:'Keep secret'},
    {k:'twilio_from',t:'text',l:'Twilio From Number',desc:'Twilio phone number with country code'},
    {k:'msg91_api_key',t:'password',l:'MSG91 API Key',desc:'From MSG91 dashboard'},
    {k:'msg91_sender_id',t:'text',l:'MSG91 Sender ID',desc:'6-char DLT approved sender ID'},
    {k:'sms_otp_template',t:'textarea',l:'OTP SMS Template',desc:'Use {otp}. Must match DLT template.'},
    {k:'sms_on_otp',t:'bool',l:'SMS for OTP',desc:'Send OTP via SMS'},
    {k:'sms_on_booking',t:'bool',l:'SMS on Booking',desc:'Send SMS on booking confirmation'},
    {k:'sms_on_driver_assign',t:'bool',l:'SMS on Driver Assign',desc:'SMS when driver is assigned'},
    {k:'sms_on_trip_complete',t:'bool',l:'SMS on Trip Complete',desc:'SMS on trip completion'},
  ],
  otp:[
    {k:'otp_digits',t:'select',opts:['4','6','8'],l:'OTP Digits',desc:'Length of OTP code'},
    {k:'otp_type',t:'select',opts:['numeric','alphanumeric'],l:'OTP Type',desc:'Numeric only or alphanumeric'},
    {k:'otp_channel',t:'select',opts:['sms','email','both'],l:'OTP Channel',desc:'How OTP is delivered'},
    {k:'otp_expiry_mins',t:'number',l:'OTP Expiry (mins)',desc:'How long OTP remains valid'},
    {k:'otp_resend_wait_secs',t:'number',l:'Resend Wait (secs)',desc:'Minimum wait before resend is allowed'},
    {k:'otp_max_attempts',t:'number',l:'Max Attempts',desc:'Wrong OTP attempts before blocking'},
    {k:'block_after_max_attempts',t:'bool',l:'Block After Max Attempts',desc:'Block user after too many wrong attempts'},
    {k:'block_duration_mins',t:'number',l:'Block Duration (mins)',desc:'How long user is blocked after max attempts'},
    {k:'same_otp_resend',t:'bool',l:'Same OTP on Resend',desc:'Resend same OTP or generate new one'},
    {k:'test_mode',t:'bool',l:'OTP Test Mode',desc:'Use fixed test OTP (dev only)'},
    {k:'test_otp',t:'text',l:'Test OTP Value',desc:'Fixed OTP used in test mode'},
  ],
  app_config:[
    {k:'mob_app_name',t:'text',l:'Customer App Name',desc:'Display name on app stores'},
    {k:'mob_app_tagline',t:'text',l:'App Tagline',desc:'Short description'},
    {k:'app_version',t:'text',l:'Current Version',desc:'e.g. 2.1.4'},
    {k:'bundle_id_android',t:'text',l:'Android Bundle ID',desc:'e.g. com.mytaxi.app'},
    {k:'bundle_id_ios',t:'text',l:'iOS Bundle ID',desc:'e.g. com.mytaxi.ios'},
    {k:'playstore_url',t:'text',l:'Play Store URL',desc:'Full Google Play Store link'},
    {k:'appstore_url',t:'text',l:'App Store URL',desc:'Full Apple App Store link'},
    {k:'mob_primary_color',t:'color',l:'App Primary Color',desc:'Primary brand color in mobile app'},
    {k:'mob_secondary_color',t:'color',l:'App Secondary Color',desc:'Secondary color in mobile app'},
    {k:'splash_bg_color',t:'color',l:'Splash Background',desc:'Splash screen background color'},
    {k:'splash_text_color',t:'color',l:'Splash Text Color',desc:'Text color on splash screen'},
    {k:'bottom_nav_color',t:'color',l:'Bottom Nav Color',desc:'Bottom navigation bar background'},
    {k:'app_icon_url',t:'text',l:'App Icon URL',desc:'Link to 1024x1024 app icon PNG'},
    {k:'splash_logo_url',t:'text',l:'Splash Logo URL',desc:'Link to splash screen logo PNG'},
    {k:'driver_app_name',t:'text',l:'Driver App Name',desc:'Name of the driver-facing app'},
    {k:'driver_bundle_android',t:'text',l:'Driver Android Bundle',desc:'Driver app package name'},
    {k:'force_update_enabled',t:'bool',l:'Force Update',desc:'Block old app versions from running'},
    {k:'min_version_android',t:'text',l:'Min Android Version',desc:'Oldest supported Android app version'},
    {k:'min_version_ios',t:'text',l:'Min iOS Version',desc:'Oldest supported iOS app version'},
  ],
};

function Toggle({ value, onChange }) {
  const on = !!value;
  return (
    <div onClick={() => onChange(!on)} className={`toggle-switch ${on ? 'active' : ''}`}>
      <div className="toggle-knob" style={{ left: on ? 25 : 3 }}/>
    </div>
  );
}

function PasswordField({ value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show?'text':'password'} className="form-input pr-40"
        value={value||''} onChange={e=>onChange(e.target.value)} />
      <button type="button" onClick={()=>setShow(s=>!s)}
        className="absolute right-10 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-sub text-14">
        {show ? (
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle><line x1="1" y1="1" x2="23" y2="23"></line></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        )}
      </button>
    </div>
  );
}

function ColorField({ value, onChange }) {
  return (
    <div className="flex items-center gap-10">
      <input type="color" value={value||'#000000'} onChange={e=>onChange(e.target.value)}
        className="color-picker-input"/>
      <input className="form-input flex-1 font-mono" value={value||''} onChange={e=>onChange(e.target.value)}
        placeholder="#rrggbb" />
      {value && <div className="color-preview" style={{background:value}}/>}
    </div>
  );
}

function SettingField({ field, value, onChange }) {
  const { k, l, t, opts, desc } = field;
  let input;
  if (t==='bool') {
    input = <Toggle value={value} onChange={v=>onChange(k,v)}/>;
  } else if (t==='select') {
    input = (
      <CustomSelect className="form-input" value={value??''} onChange={e=>onChange(k,e.target.value)}>
        {(opts||[]).map(o=><option key={o} value={o}>{o}</option>)}
      </CustomSelect>
    );
  } else if (t==='textarea') {
    input = <textarea className="form-input" rows={3} value={value??''} onChange={e=>onChange(k,e.target.value)} style={{resize:'vertical'}}/>;
  } else if (t==='color') {
    input = <ColorField value={value} onChange={v=>onChange(k,v)}/>;
  } else if (t==='password') {
    input = <PasswordField value={value} onChange={v=>onChange(k,v)}/>;
  } else if (k.includes('phone') || k === 'twilio_from') {
    input = (
      <PhoneInput
        country={'in'}
        value={value ?? ''}
        onChange={phone => onChange(k, phone)}
        inputProps={{ name: k }}
        containerStyle={{ width: '100%' }}
        inputStyle={{ width: '100%', height: '42px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
      />
    );
  } else {
    input = (
      <input type={t==='number'?'number':t==='time'?'time':t==='email'?'email':'text'}
        className="form-input" value={value??''}
        onChange={e=>onChange(k, t==='number'?Number(e.target.value):e.target.value)}/>
    );
  }
  return (
    <div className="grid grid-cols-[1fr_1.5fr] gap-20 items-start py-14 border-b border-light">
      <div>
        <div className="font-semibold text-13 mb-3">{l}</div>
        {desc && <div className="text-11 text-muted mt-2">{desc}</div>}
        <div className="text-10 text-muted font-mono mt-3">{k}</div>
      </div>
      <div>{input}</div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [activeSubTab, setActiveSubTab] = useState('General');
  const [allSettings, setAllSettings] = useState({});
  const [localValues, setLocalValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await settingsAPI.getAll();
        const grouped = res.data.data;
        setAllSettings(grouped);
        const flat = {};
        Object.entries(grouped).forEach(([tab, items]) => {
          flat[tab] = {};
          items.forEach(item => { flat[tab][item.key] = item.value; });
        });
        setLocalValues(flat);
      } catch { showToast('Failed to load settings','error'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleChange = useCallback((key, val) => {
    setLocalValues(prev => ({...prev, [activeTab]: {...(prev[activeTab]||{}), [key]:val}}));
    setDirty(true);
  }, [activeTab]);

  const handleSave = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const [key, val] of Object.entries(localValues[activeTab] || {})) {
      const fieldConfig = FIELDS[activeTab]?.find(f => f.k === key);
      if (fieldConfig?.t === 'email' && val && !emailRegex.test(val)) {
        return showToast(`Invalid email for ${fieldConfig.l}`, 'error');
      }
      if ((key.includes('phone') || key === 'twilio_from') && val && val.length < 5) {
        return showToast(`Invalid phone number for ${fieldConfig.l}`, 'error');
      }
    }
    try {
      setSaving(true);
      await settingsAPI.updateCategory(activeTab, localValues[activeTab]||{});
      setDirty(false);
      showToast(`${TABS.find(t=>t.k===activeTab)?.label||activeTab} settings saved!`,'success');

      if (activeTab === 'general' && localValues.general) {
        const { primary_color, secondary_color, accent_color } = localValues.general;
        const root = document.documentElement;
        if (primary_color) root.style.setProperty('--orange', primary_color);
        if (secondary_color) root.style.setProperty('--sidebar', secondary_color);
        if (accent_color) root.style.setProperty('--green', accent_color);
      }
    } catch { showToast('Failed to save settings','error'); }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    const original = {};
    (allSettings[activeTab]||[]).forEach(item=>{ original[item.key]=item.value; });
    setLocalValues(prev=>({...prev,[activeTab]:original}));
    setDirty(false);
    showToast('Reset to last saved values','info');
  };

  const handleSeed = async () => {
    try {
      await settingsAPI.seed();
      showToast('Default settings seeded!','success');
      window.location.reload();
    } catch { showToast('Seed failed','error'); }
  };

  const currentTab = TABS.find(t=>t.k===activeTab);
  const fields = FIELDS[activeTab]||[];
  const values = localValues[activeTab]||{};

  return (
    <div>
      <div className="grid grid-cols-[210px_1fr] gap-18 items-start">
        <div className="settings-sidebar card p-8 sticky top-22">
          {TABS.map(tab=>(
            <button key={tab.k} onClick={()=>{setActiveTab(tab.k);setActiveSubTab('General');setDirty(false);}} className={`flex flex-col w-full px-13 py-10 text-left border-none cursor-pointer rounded-8 mb-2 font-inherit transition-150 ${activeTab===tab.k ? 'bg-orange text-white' : 'bg-none text-sub'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span dangerouslySetInnerHTML={{ __html: ICONS[tab.k] }} style={{ display: 'flex', alignItems: 'center', opacity: activeTab === tab.k ? 1 : 0.8 }} />
                <span className={`text-12 ${activeTab===tab.k ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
              </div>
              <span className="text-10 mt-1" style={{ opacity: activeTab === tab.k ? 0.9 : 0.7, paddingLeft: 26, lineHeight: 1.3 }}>{tab.desc}</span>
            </button>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <span className="card-title text-15">{currentTab?.label} Settings</span>
              <div className="text-11 text-muted mt-2">{currentTab?.desc}</div>
            </div>
            <span className="text-12 text-sub">{fields.length} configurations</span>
          </div>
          
          {(() => {
            const groupsInCurrentTab = Array.from(new Set(fields.map(f => f.group).filter(Boolean)));
            if (groupsInCurrentTab.length > 0) {
              return (
                <div className="px-22 pt-16">
                  <div className="tab-bar">
                    {groupsInCurrentTab.map(group => (
                      <button 
                        key={group} 
                        className={`tab-btn ${activeSubTab === group ? 'active' : ''}`}
                        onClick={() => setActiveSubTab(group)}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <div className="px-22 pb-8">
            {loading ? (
              <div className="text-center p-60 text-muted">Loading settings…</div>
            ) : (
              (fields.some(f => f.group) ? fields.filter(f => (f.group || 'General') === activeSubTab) : fields).map(f=><SettingField key={f.k} field={f} value={values[f.k]} onChange={handleChange}/>)
            )}
          </div>
          <div className="px-22 py-16 border-t border-light flex justify-between items-center bg-slate-50 rounded-b-12">
            <span className="text-12 text-muted">
              {dirty ? 'You have unsaved changes' : 'All changes saved'}
            </span>
            <div className="flex gap-10">
              <button className="btn btn-outline" onClick={handleReset} disabled={!dirty}>Reset</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving||!dirty}>
                {saving?'Saving…':'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

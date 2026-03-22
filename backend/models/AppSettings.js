const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key:         { type: String, required: true, unique: true },
  value:       { type: mongoose.Schema.Types.Mixed, required: true },
  category: {
    type: String,
    enum: ['general','ride','referral','payment','legal','push','mail','mobile_otp','otp','app_config'],
    default: 'general'
  },
  label:       { type: String },
  description: { type: String },
  dataType:    { type: String, enum: ['string','number','boolean','color','password','select','textarea','time','email','text'], default: 'text' },
  options:     [{ type: String }],        // for select fields
  isSecret:    { type: Boolean, default: false },
  updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ── Default seed data ──────────────────────────────────────────────────────
settingsSchema.statics.seed = async function () {
  const defaults = [
    // ── GENERAL ──
    { key:'app_name',          category:'general', label:'App Name',           dataType:'text',     value:'MyTaxi',                            description:'Displayed across the platform' },
    { key:'tagline',           category:'general', label:'Tagline',            dataType:'text',     value:'Your ride, your way',               description:'Short tagline shown on splash' },
    { key:'support_email',     category:'general', label:'Support Email',      dataType:'email',    value:'support@mytaxi.com',                description:'Customer support email' },
    { key:'support_phone',     category:'general', label:'Support Phone',      dataType:'text',     value:'+91 9900000000',                    description:'Helpline number' },
    { key:'currency',          category:'general', label:'Currency',           dataType:'select',   value:'INR', options:['INR','USD','EUR','GBP','AED'], description:'Default currency' },
    { key:'timezone',          category:'general', label:'Timezone',           dataType:'select',   value:'Asia/Kolkata', options:['Asia/Kolkata','UTC','America/New_York','Europe/London','Asia/Dubai'], description:'Platform timezone' },
    { key:'date_format',       category:'general', label:'Date Format',        dataType:'select',   value:'DD/MM/YYYY', options:['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'], description:'Date display format' },
    { key:'country',           category:'general', label:'Country',            dataType:'text',     value:'India',                             description:'Operating country' },
    { key:'primary_color',     category:'general', label:'Primary Color',      dataType:'color',    value:'#E87722',                           description:'Main brand color' },
    { key:'secondary_color',   category:'general', label:'Secondary Color',    dataType:'color',    value:'#16213e',                           description:'Sidebar/dark color' },
    { key:'accent_color',      category:'general', label:'Accent Color',       dataType:'color',    value:'#22c55e',                           description:'Success/active color' },
    { key:'logo_url',          category:'general', label:'Logo URL',           dataType:'text',     value:'',                                  description:'Full URL to app logo' },
    { key:'favicon_url',       category:'general', label:'Favicon URL',        dataType:'text',     value:'',                                  description:'URL to favicon' },
    { key:'maintenance_mode',  category:'general', label:'Maintenance Mode',   dataType:'boolean',  value:false,                               description:'Disable app for users' },
    { key:'demo_mode',         category:'general', label:'Demo Mode',          dataType:'boolean',  value:false,                               description:'Enable demo data' },

    // ── RIDE CONFIG ──
    { key:'day_start',              category:'ride', label:'Day Start Time',          dataType:'time',    value:'06:00',  description:'Start of day-rate window' },
    { key:'day_end',                category:'ride', label:'Day End Time',            dataType:'time',    value:'22:00',  description:'End of day-rate window' },
    { key:'night_charge_enabled',   category:'ride', label:'Night Charge',            dataType:'boolean', value:true,     description:'Apply surcharge at night' },
    { key:'night_surcharge_pct',    category:'ride', label:'Night Surcharge (%)',      dataType:'number',  value:25,       description:'Extra % added to fare at night' },
    { key:'surge_enabled',          category:'ride', label:'Surge Pricing',           dataType:'boolean', value:false,    description:'Auto-activate surge during high demand' },
    { key:'surge_multiplier',       category:'ride', label:'Surge Multiplier',         dataType:'number',  value:1.5,      description:'Fare multiplier during surge' },
    { key:'surge_threshold',        category:'ride', label:'Surge Threshold (%)',      dataType:'number',  value:80,       description:'Driver occupancy % that triggers surge' },
    { key:'cancel_window_mins',     category:'ride', label:'Free Cancel Window (mins)',dataType:'number',  value:5,        description:'Minutes before fee applies' },
    { key:'cancel_fee',             category:'ride', label:'Cancellation Fee (₹)',     dataType:'number',  value:30,       description:'Fee after free window' },
    { key:'auto_assign',            category:'ride', label:'Auto Assign Driver',       dataType:'boolean', value:true,     description:'Assign nearest available driver' },
    { key:'assign_timeout_secs',    category:'ride', label:'Assign Timeout (secs)',    dataType:'number',  value:30,       description:'Seconds before trying next driver' },
    { key:'max_driver_distance_km', category:'ride', label:'Max Driver Distance (km)', dataType:'number',  value:10,       description:'Radius to search for drivers' },
    { key:'ride_otp_enabled',       category:'ride', label:'Ride Start OTP',           dataType:'boolean', value:true,     description:'Driver must enter OTP to start ride' },
    { key:'rating_enabled',         category:'ride', label:'Ratings Enabled',          dataType:'boolean', value:true,     description:'Allow customers to rate drivers' },
    { key:'sos_enabled',            category:'ride', label:'SOS Enabled',              dataType:'boolean', value:true,     description:'Enable emergency SOS button' },

    // ── REFERRAL ──
    { key:'referral_enabled',        category:'referral', label:'Referral Program',        dataType:'boolean', value:true,  description:'Enable/disable referral system' },
    { key:'referral_code_prefix',    category:'referral', label:'Code Prefix',             dataType:'text',    value:'MYTAXI', description:'Prefix for generated codes' },
    { key:'referral_link_template',  category:'referral', label:'Referral Link Template',  dataType:'text',    value:'https://mytaxi.app/ref/{code}', description:'Use {code} as placeholder' },
    { key:'referrer_bonus',          category:'referral', label:'Referrer Bonus (₹)',       dataType:'number',  value:50,    description:'Credit to referrer' },
    { key:'referee_bonus',           category:'referral', label:'Referee Bonus (₹)',        dataType:'number',  value:100,   description:'Credit to new user' },
    { key:'bonus_credit_after_rides',category:'referral', label:'Credit After Rides',       dataType:'number',  value:1,     description:'Rides required before bonus is credited' },
    { key:'min_rides_to_earn',       category:'referral', label:'Min Rides to Earn',        dataType:'number',  value:1,     description:'Referrer earns after this many rides' },
    { key:'max_referrals_per_user',  category:'referral', label:'Max Referrals / User',     dataType:'number',  value:20,    description:'Cap on referrals per user' },
    { key:'referral_expiry_days',    category:'referral', label:'Referral Expiry (days)',   dataType:'number',  value:30,    description:'Days before unused referral expires' },

    // ── PAYMENT ──
    { key:'commission_rate',     category:'payment', label:'Commission Rate (%)',  dataType:'number',  value:15,           description:'Platform cut per ride' },
    { key:'commission_type',     category:'payment', label:'Commission Type',      dataType:'select',  value:'percentage', options:['percentage','flat'], description:'How commission is calculated' },
    { key:'gateway_primary',     category:'payment', label:'Primary Gateway',      dataType:'select',  value:'razorpay',   options:['razorpay','stripe','paytm','ccavenue'], description:'Main payment processor' },
    { key:'razorpay_key_id',     category:'payment', label:'Razorpay Key ID',      dataType:'text',    value:'',           isSecret:false, description:'Razorpay live/test key ID' },
    { key:'razorpay_key_secret', category:'payment', label:'Razorpay Key Secret',  dataType:'password',value:'',           isSecret:true,  description:'Razorpay secret' },
    { key:'stripe_pub_key',      category:'payment', label:'Stripe Pub Key',       dataType:'text',    value:'',           description:'Stripe pk_ key' },
    { key:'stripe_secret_key',   category:'payment', label:'Stripe Secret Key',    dataType:'password',value:'',           isSecret:true, description:'Stripe sk_ key' },
    { key:'auto_payout',         category:'payment', label:'Auto Payout',          dataType:'boolean', value:true,         description:'Auto pay drivers on schedule' },
    { key:'payout_schedule',     category:'payment', label:'Payout Schedule',      dataType:'select',  value:'weekly',     options:['daily','weekly','biweekly','monthly'], description:'How often payouts run' },
    { key:'payout_day',          category:'payment', label:'Payout Day',           dataType:'select',  value:'monday',     options:['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], description:'Day for weekly payout' },
    { key:'payout_min_amount',   category:'payment', label:'Min Payout Amount (₹)',dataType:'number',  value:100,          description:'Minimum balance for payout' },
    { key:'cod_enabled',         category:'payment', label:'Cash on Delivery',     dataType:'boolean', value:true,         description:'Allow cash payments' },
    { key:'wallet_enabled',      category:'payment', label:'Wallet Payments',      dataType:'boolean', value:true,         description:'Allow in-app wallet' },
    { key:'upi_enabled',         category:'payment', label:'UPI Payments',         dataType:'boolean', value:true,         description:'Allow UPI' },
    { key:'card_enabled',        category:'payment', label:'Card Payments',        dataType:'boolean', value:true,         description:'Allow card payments' },
    { key:'gst_enabled',         category:'payment', label:'GST Enabled',          dataType:'boolean', value:true,         description:'Apply GST to rides' },
    { key:'gst_percentage',      category:'payment', label:'GST Percentage (%)',   dataType:'number',  value:18,           description:'Applicable GST rate' },

    // ── LEGAL ──
    { key:'company_name',      category:'legal', label:'Company Name',         dataType:'text',     value:'MyTaxi Technologies Pvt. Ltd.', description:'Legal company name' },
    { key:'company_address',   category:'legal', label:'Registered Address',   dataType:'textarea', value:'123, Tech Park, Bangalore - 560001', description:'Full registered address' },
    { key:'gst_number',        category:'legal', label:'GST Number',           dataType:'text',     value:'29ABCDE1234F1Z5', description:'GST registration number' },
    { key:'cin_number',        category:'legal', label:'CIN Number',           dataType:'text',     value:'U72900KA2020PTC123456', description:'Company Identification Number' },
    { key:'terms_url',         category:'legal', label:'Terms & Conditions URL',dataType:'text',    value:'https://mytaxi.com/terms', description:'T&C page link' },
    { key:'privacy_url',       category:'legal', label:'Privacy Policy URL',   dataType:'text',     value:'https://mytaxi.com/privacy', description:'Privacy policy link' },
    { key:'cancellation_policy',category:'legal',label:'Cancellation Policy URL',dataType:'text',   value:'https://mytaxi.com/cancellation', description:'Cancellation policy link' },
    { key:'refund_policy',     category:'legal', label:'Refund Policy URL',    dataType:'text',     value:'https://mytaxi.com/refund', description:'Refund policy link' },
    { key:'about_url',         category:'legal', label:'About Us URL',         dataType:'text',     value:'https://mytaxi.com/about', description:'About us page link' },

    // ── PUSH NOTIFICATIONS ──
    { key:'push_enabled',          category:'push', label:'Enable Push Notifications', dataType:'boolean', value:true,  description:'Master toggle for all push notifications' },
    { key:'firebase_project_id',   category:'push', label:'Firebase Project ID',      dataType:'text',     value:'',    description:'Shared project ID across Web, Android, iOS' },
    { key:'firebase_client_email', category:'push', label:'Firebase Client Email',    dataType:'email',    value:'',    description:'Service Account Email for Backend Admin SDK' },
    { key:'firebase_private_key',  category:'push', label:'Firebase Private Key',     dataType:'textarea', value:'',    isSecret:true, description:'Service Account Private Key' },
    { key:'push_on_booking',       category:'push', label:'On Booking Confirmed',     dataType:'boolean',  value:true,  description:'Notify when booking is confirmed' },
    { key:'push_on_driver_assign', category:'push', label:'On Driver Assigned',       dataType:'boolean',  value:true,  description:'Notify when driver is assigned' },
    { key:'push_on_trip_complete', category:'push', label:'On Trip Complete',         dataType:'boolean',  value:true,  description:'Notify when trip ends' },
    { key:'push_on_payment',       category:'push', label:'On Payment',               dataType:'boolean',  value:true,  description:'Notify on successful payment' },
    { key:'push_on_promo',         category:'push', label:'On Promo / Offer',         dataType:'boolean',  value:false, description:'Notify for promotional messages' },
    { key:'firebase_web_enabled',  category:'push', label:'Enable Web Push',          dataType:'boolean',  value:false, description:'Send notifications to Web interface' },
    { key:'firebase_web_api_key',  category:'push', label:'Web - API Key',            dataType:'text',     value:'',    description:'Firebase API Key for frontend Web client initialization' },
    { key:'firebase_web_app_id',   category:'push', label:'Web - App ID',             dataType:'text',     value:'',    description:'Firebase Web App identifier' },
    { key:'firebase_web_vapid_key',category:'push', label:'Web - VAPID Key',          dataType:'text',     value:'',    description:'Web Push voluntary application server identification key' },
    { key:'firebase_android_enabled',category:'push',label:'Enable Android Push',     dataType:'boolean',  value:true,  description:'Send notifications to Android mobile app via FCM' },
    { key:'firebase_android_app_id', category:'push',label:'Android - App ID',        dataType:'text',     value:'',    description:'Firebase App Identifier for the Android app' },
    { key:'firebase_ios_enabled',  category:'push', label:'Enable iOS Push',          dataType:'boolean',  value:true,  description:'Send notifications to iOS app' },
    { key:'firebase_ios_app_id',   category:'push', label:'iOS - App ID',             dataType:'text',     value:'',    description:'Firebase App Identifier for the iOS Apple app' },

    // ── MAIL / OTP ──
    { key:'mail_enabled',            category:'mail', label:'Email Enabled',          dataType:'boolean',  value:true,            description:'Master toggle for emails' },
    { key:'smtp_host',               category:'mail', label:'SMTP Host',              dataType:'text',     value:'smtp.gmail.com', description:'e.g. smtp.gmail.com' },
    { key:'smtp_port',               category:'mail', label:'SMTP Port',              dataType:'number',   value:587,             description:'587 (TLS) or 465 (SSL)' },
    { key:'smtp_secure',             category:'mail', label:'SMTP Secure (TLS)',      dataType:'boolean',  value:true,            description:'Use TLS for SMTP' },
    { key:'smtp_user',               category:'mail', label:'SMTP Username',          dataType:'text',     value:'',              description:'Email account username' },
    { key:'smtp_pass',               category:'mail', label:'SMTP Password',          dataType:'password', value:'', isSecret:true, description:'Email account password' },
    { key:'from_name',               category:'mail', label:'From Name',              dataType:'text',     value:'MyTaxi',        description:'Sender display name' },
    { key:'from_email',              category:'mail', label:'From Email',             dataType:'email',    value:'noreply@mytaxi.com', description:'Sender email address' },
    { key:'otp_subject',             category:'mail', label:'OTP Email Subject',      dataType:'text',     value:'Your MyTaxi OTP', description:'OTP email subject line' },
    { key:'otp_template',            category:'mail', label:'OTP Email Template',     dataType:'textarea', value:'Your OTP is {otp}. Valid for {expiry} minutes.', description:'Use {otp} and {expiry}' },
    { key:'welcome_enabled',         category:'mail', label:'Welcome Email',          dataType:'boolean',  value:true,            description:'Send welcome email on signup' },
    { key:'booking_confirm_enabled', category:'mail', label:'Booking Confirmation',   dataType:'boolean',  value:true,            description:'Email on booking confirmation' },

    // ── MOBILE OTP ──
    { key:'sms_enabled',          category:'mobile_otp', label:'SMS Enabled',          dataType:'boolean', value:true,    description:'Master toggle for SMS' },
    { key:'sms_provider',         category:'mobile_otp', label:'SMS Provider',         dataType:'select',  value:'twilio', options:['twilio','msg91','aws_sns','nexmo','textlocal'], description:'SMS gateway' },
    { key:'twilio_sid',           category:'mobile_otp', label:'Twilio Account SID',   dataType:'text',    value:'',      description:'From Twilio console' },
    { key:'twilio_token',         category:'mobile_otp', label:'Twilio Auth Token',    dataType:'password',value:'', isSecret:true, description:'Twilio auth token' },
    { key:'twilio_from',          category:'mobile_otp', label:'Twilio From Number',   dataType:'text',    value:'',      description:'Twilio phone with country code' },
    { key:'msg91_api_key',        category:'mobile_otp', label:'MSG91 API Key',        dataType:'password',value:'', isSecret:true, description:'MSG91 dashboard key' },
    { key:'msg91_sender_id',      category:'mobile_otp', label:'MSG91 Sender ID',      dataType:'text',    value:'MYTAXI', description:'6-char DLT approved sender ID' },
    { key:'sms_otp_template',     category:'mobile_otp', label:'OTP SMS Template',     dataType:'textarea',value:'Your MyTaxi OTP is {otp}. Do not share it.', description:'Use {otp}. Must match DLT template.' },
    { key:'sms_on_otp',           category:'mobile_otp', label:'SMS for OTP',          dataType:'boolean', value:true,    description:'Send OTP via SMS' },
    { key:'sms_on_booking',       category:'mobile_otp', label:'SMS on Booking',       dataType:'boolean', value:true,    description:'SMS on booking confirmation' },
    { key:'sms_on_driver_assign', category:'mobile_otp', label:'SMS on Driver Assign', dataType:'boolean', value:true,    description:'SMS when driver assigned' },
    { key:'sms_on_trip_complete', category:'mobile_otp', label:'SMS on Trip Complete', dataType:'boolean', value:true,    description:'SMS on trip completion' },

    // ── OTP CONFIG ──
    { key:'otp_digits',               category:'otp', label:'OTP Digits',             dataType:'select',  value:'6', options:['4','6','8'], description:'Length of OTP code' },
    { key:'otp_type',                 category:'otp', label:'OTP Type',               dataType:'select',  value:'numeric', options:['numeric','alphanumeric'], description:'Numeric or alphanumeric' },
    { key:'otp_channel',              category:'otp', label:'OTP Channel',            dataType:'select',  value:'both', options:['sms','email','both'], description:'How OTP is delivered' },
    { key:'otp_expiry_mins',          category:'otp', label:'OTP Expiry (mins)',      dataType:'number',  value:5,     description:'How long OTP is valid' },
    { key:'otp_resend_wait_secs',     category:'otp', label:'Resend Wait (secs)',     dataType:'number',  value:30,    description:'Wait before resend allowed' },
    { key:'otp_max_attempts',         category:'otp', label:'Max Attempts',           dataType:'number',  value:3,     description:'Wrong attempts before block' },
    { key:'block_after_max_attempts', category:'otp', label:'Block After Max Attempts',dataType:'boolean',value:true,  description:'Block user after too many wrong attempts' },
    { key:'block_duration_mins',      category:'otp', label:'Block Duration (mins)',  dataType:'number',  value:30,    description:'How long user is blocked' },
    { key:'same_otp_resend',          category:'otp', label:'Same OTP on Resend',     dataType:'boolean', value:false, description:'Resend same OTP or generate new' },
    { key:'test_mode',                category:'otp', label:'OTP Test Mode',          dataType:'boolean', value:false, description:'Use fixed OTP in dev/test' },
    { key:'test_otp',                 category:'otp', label:'Test OTP Value',         dataType:'text',    value:'123456', description:'Fixed OTP used in test mode' },

    // ── APP CONFIG ──
    { key:'mob_app_name',          category:'app_config', label:'Customer App Name',     dataType:'text',    value:'MyTaxi',   description:'Name on app stores' },
    { key:'mob_app_tagline',       category:'app_config', label:'App Tagline',           dataType:'text',    value:'Your ride, your way', description:'Short description' },
    { key:'app_version',           category:'app_config', label:'Current Version',       dataType:'text',    value:'2.1.4',   description:'e.g. 2.1.4' },
    { key:'bundle_id_android',     category:'app_config', label:'Android Bundle ID',     dataType:'text',    value:'com.mytaxi.app', description:'Android package name' },
    { key:'bundle_id_ios',         category:'app_config', label:'iOS Bundle ID',         dataType:'text',    value:'com.mytaxi.ios', description:'iOS bundle identifier' },
    { key:'playstore_url',         category:'app_config', label:'Play Store URL',        dataType:'text',    value:'',        description:'Google Play Store link' },
    { key:'appstore_url',          category:'app_config', label:'App Store URL',         dataType:'text',    value:'',        description:'Apple App Store link' },
    { key:'mob_primary_color',     category:'app_config', label:'App Primary Color',     dataType:'color',   value:'#E87722', description:'Primary color in mobile app' },
    { key:'mob_secondary_color',   category:'app_config', label:'App Secondary Color',   dataType:'color',   value:'#16213e', description:'Secondary color in app' },
    { key:'splash_bg_color',       category:'app_config', label:'Splash Background',     dataType:'color',   value:'#E87722', description:'Splash screen background' },
    { key:'splash_text_color',     category:'app_config', label:'Splash Text Color',     dataType:'color',   value:'#ffffff', description:'Text color on splash' },
    { key:'bottom_nav_color',      category:'app_config', label:'Bottom Nav Color',      dataType:'color',   value:'#ffffff', description:'Bottom navigation bar color' },
    { key:'app_icon_url',          category:'app_config', label:'App Icon URL',          dataType:'text',    value:'',        description:'1024×1024 icon PNG URL' },
    { key:'splash_logo_url',       category:'app_config', label:'Splash Logo URL',       dataType:'text',    value:'',        description:'Splash screen logo URL' },
    { key:'driver_app_name',       category:'app_config', label:'Driver App Name',       dataType:'text',    value:'MyTaxi Driver', description:'Driver-facing app name' },
    { key:'driver_bundle_android', category:'app_config', label:'Driver Android Bundle', dataType:'text',    value:'com.mytaxi.driver', description:'Driver app package name' },
    { key:'force_update_enabled',  category:'app_config', label:'Force Update',          dataType:'boolean', value:false,     description:'Block old app versions' },
    { key:'min_version_android',   category:'app_config', label:'Min Android Version',   dataType:'text',    value:'2.0.0',   description:'Oldest supported Android version' },
    { key:'min_version_ios',       category:'app_config', label:'Min iOS Version',       dataType:'text',    value:'2.0.0',   description:'Oldest supported iOS version' },
  ];

  for (const d of defaults) {
    await this.findOneAndUpdate({ key: d.key }, d, { upsert: true, new: true });
  }
};

module.exports = mongoose.model('AppSettings', settingsSchema);

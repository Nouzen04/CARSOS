# EmailJS Setup for Workshop OTP Verification

The OTP email flow uses [EmailJS](https://www.emailjs.com/) — a free, client-side email API that requires **no backend server or Cloud Functions**.

## 3 Values You Need to Fill In

Open `app/signup.tsx` and look for this block near the top of the file (lines ~35–38):

```ts
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
```

Replace the three placeholder strings with your real values from the EmailJS dashboard (see below).

---

## Step-by-Step Setup

### 1. Create a free EmailJS account
Go to https://www.emailjs.com/ and sign up (free tier: 200 emails/month).

### 2. Add an Email Service → get `SERVICE_ID`
1. In the dashboard, click **Email Services → Add New Service**.
2. Choose your provider (Gmail, Outlook, etc.) and connect your account.
3. Copy the **Service ID** — this is your `EMAILJS_SERVICE_ID`.

### 3. Create an Email Template → get `TEMPLATE_ID`
1. Click **Email Templates → Create New Template**.
2. Set the **Subject** to something like: `Your CARSOS Workshop Verification Code`
3. In the **Body**, use the two template variables below exactly as written:

```
Hello,

Your CARSOS workshop verification code is:

{{otp_code}}

This code expires in 5 minutes. Do not share it with anyone.

If you did not request this, please ignore this email.

— The CARSOS Team
```

4. In the **To Email** field of the template settings, enter: `{{to_email}}`
5. Save the template and copy the **Template ID** — this is your `EMAILJS_TEMPLATE_ID`.

> **Important:** The variable names `{{to_email}}` and `{{otp_code}}` must match exactly.
> The code in `signup.tsx` sends `template_params: { to_email, otp_code }`.

### 4. Get your Public Key → `PUBLIC_KEY`
1. In the dashboard, go to **Account → General**.
2. Copy the **Public Key** — this is your `EMAILJS_PUBLIC_KEY`.

---

## Final Result

After filling in the values, your code block should look like:

```ts
const EMAILJS_SERVICE_ID  = 'service_abc123';
const EMAILJS_TEMPLATE_ID = 'template_xyz789';
const EMAILJS_PUBLIC_KEY  = 'user_XXXXXXXXXXXXXXX';
```

---

## Security Notes

- The public key is intentionally safe to ship in client-side code (EmailJS is designed for browser/RN use).
- EmailJS free tier: **200 emails/month**, 2 email services, unlimited templates.
- To increase limits, upgrade to a paid EmailJS plan, or swap the `sendOtpEmail()` function body in `signup.tsx` for another REST provider (Resend, Brevo, etc.) — the surrounding OTP logic stays the same.

# Frontend → Backend API usage

This document shows how the Next.js frontend can call the backend API for registration and login.

## Base URL

-  Local development backend: `http://localhost:8080`

## Endpoints

-  `POST /auth/register`
-  `POST /auth/login` → returns `{ user, token }` (JWT)

## Example: register user

```js
async function registerUser(form) {
   const res = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
   });
   if (!res.ok) throw new Error("Registration failed");
   return res.json();
}
```

Expected `form` shape:

```js
{
  fname: "Ada",
  lname: "Lovelace",
  email: "ada@example.com",
  phone: "555-1234",
  user_state: "CA",
  account_type: "Buyer",
  pword: "Passw0rd!",
  terms: true
}
```

Response:

```js
{ success: true, user: { ... } }
```

## Example: login and store JWT

```js
async function login(email, pword) {
   const res = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, pword }),
   });
   if (!res.ok) throw new Error("Login failed");
   const { user, token } = await res.json();
   localStorage.setItem("token", token);
   return user;
}
```

## Example: authenticated request

```js
async function fetchWithAuth(path) {
   const token = localStorage.getItem("token");
   const res = await fetch(`http://localhost:8080${path}`, {
      headers: {
         Authorization: `Bearer ${token}`,
      },
   });
   if (!res.ok) throw new Error("Request failed");
   return res.json();
}
```

## Notes

-  Set `JWT_SECRET` in `backend/.env`.
-  Backend login issues a JWT for 7 days.
-  For Next.js server actions, prefer sending the token via cookies instead of localStorage.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

-  [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-  [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# HTTPS Auth

From-scratch implementation of authentication flow over HTTPS using stateful back-end session management.

`nuxt3`, `aws-ses`, `postgresql`

Live deployment [httpsauth.munozarturo.com](https://httpsauth.munozarturo.com/).

## To Do

* Development Tools
  * [x] Add event subscription and broadcaster for auth events
* Authentication FLow
  * [ ] Security Headers
  * [ ] API Rate Limiter
  * [ ] Fix SVGs
* QOL
  * [ ] Improve form formatting.
  * [ ] [SEO and Meta](https://nuxt.com/docs/getting-started/seo-meta)
* Documentation
  * [ ] Improve `README.md`.
  * [ ] Write guide on how to implement authentication from scracth.

## Setup

1. Set environmet variables in `.env`.

    ```bash
    NODE_ENV="development|production"

    PGSQL_URI="" # postgres connection string

    NUXT_URL="" # deployment URL, eg. https://httpsauth.munozarturo.com
    DOMAIN="" # domain (used for emails), eg. httpsauth.munozarturo.com or communications.munozarturo.com

    AWS_REGION="" # AWS region, eg. us-east-2
    AWS_KEY="" # AWS key
    AWS_SECRET_ACCESS_KEY="" # AWS secret access key
    ```

2. Run `npm run db:generate`.
3. Run the SQL scripts in [`utils/db/out`](utils/db/out) in the database engine.
   * This project is built to work with PostgreSQL.
4. Run `npm run dev` for local development.

### Setup Notes

Remove the following:

* `getStats` in `utils/db/auth-actions.ts`
* `server/api/auth/stats.get.ts`
* stats display in `pages/index.vue`

## Notes

### Events

There is an event publish/subscribe plugin implemented in `plugins/events.ts`. It is possible to listen to events using the following pattern

```typescript
const { $subcribe } = useNuxtApp();

$subcribe("auth:sign-out", () => {
  console.log("Signed Out.")
});
```

and emit events using this pattern

```typescript
const { $publish } = useNuxtApp();

$publish("auth:sign-out", null); // can change event payload type from null to something else
```

### Build Command with ESBuild Copy

The build command is different since there are some issues with the `vue-email` package and including the `esbuild-linux-64` directory in the output. Refer to [this](https://github.com/vue-email/vue-email/issues/58) GitHub issue.

```json
"scripts": {
    ...,
    "build": "nuxt build && cp -r ./node_modules/esbuild-linux-64 ./.vercel/output/functions/__nitro.func/node_modules/esbuild-linux-64",
    ...,
},
```

If the deployment service is something other than Vercel, `./.vercel/output/functions/__nitro.func/node_modules/esbuild-linux-64` can be replaced with the output directory is for the deployment service.

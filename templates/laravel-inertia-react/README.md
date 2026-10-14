# Onu + Laravel + Inertia + React starter

A lean [Laravel](https://laravel.com) 13 app with [Inertia](https://inertiajs.com) 3, React, TypeScript, Vite and Tailwind CSS v4, wired up with [`@javaabu/onu`](../../packages/onu). No authentication scaffolding.

| File                                                                             | What                                                                                                                                 |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `resources/css/app.css`                                                          | Tailwind, Onu's tokens (`@javaabu/onu/tailwind.css`) and the font pack (`@javaabu/onu/fonts.css`)                                    |
| `resources/js/app.tsx`                                                           | `createInertiaApp`, `ThemeProvider`, `TooltipProvider` and the default persistent layout                                             |
| `resources/js/layouts/app-shell.tsx`                                             | `OnuProvider` (locale + Inertia's `Link` as `linkComponent`), `AppLayout`, `AppSidebar`, `AppHeader` and the English / ދިވެހި switch |
| `resources/js/pages/dashboard.tsx`                                               | The admin shell page: `PageTitle`, `Callout`, `Card`, `StatusBadge`                                                                  |
| `resources/js/pages/applications/create.tsx`                                     | A form that posts with Inertia's `useForm` and shows Laravel's validation errors through Onu's `Form`                                |
| `app/Http/Controllers/ApplicationController.php`                                 | Validates the form with `$request->validate()`                                                                                       |
| `app/Http/Controllers/LocaleController.php`, `app/Http/Middleware/SetLocale.php` | Stores the chosen locale in the session and applies it to every request                                                              |
| `app/Http/Middleware/HandleInertiaRequests.php`                                  | Shares `locale` and the `success` flash message with every page                                                                      |
| `resources/views/app.blade.php`                                                  | Renders `<html lang dir>` on the server and applies the stored theme before the first paint                                          |
| `lang/dv/validation.php`, `lang/dv.json`                                         | Dhivehi validation messages for the rules used here                                                                                  |
| `tests/Feature/ApplicationFormTest.php`                                          | Feature tests for the form endpoint, the shared props and the locale switch                                                          |

## How validation errors reach the fields

`ApplicationController@store` calls `$request->validate()`. On failure Laravel redirects back, Inertia puts the messages in `form.errors`, and the page passes them to Onu's `Form`:

```tsx
<Form errors={form.errors} processing={form.processing} onSubmit={() => form.post("/applications")}>
    <FormField label="Email" name="email" required>
        <TextInput value={form.data.email} onChange={(e) => form.setData("email", e.target.value)} />
    </FormField>
    <SubmitButton>Submit</SubmitButton>
</Form>
```

Each message shows under the `FormField` with the same `name`, the first invalid field gets focus, and an error summary lists them all. See [Forms & Laravel validation](../../docs/guides/forms-and-laravel.md).

## Use it on its own

Requires PHP 8.3+, Composer and Node 20.19+. Once `@javaabu/onu` is published to npm, copy the folder (for example with [degit](https://github.com/Rich-Harris/degit)) and point `@javaabu/onu` at the published package instead of `workspace:*`:

```bash
npx degit Javaabu/onu/templates/laravel-inertia-react my-app
cd my-app
npm pkg set dependencies.@javaabu/onu="latest"
composer setup   # composer install, .env, app key, SQLite database, npm install, npm run build
composer dev     # Laravel, the queue, logs and Vite together
```

Or step by step:

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite && php artisan migrate
npm install
npm run dev        # in one terminal
php artisan serve  # in another
```

`php artisan test` runs the feature tests.

The default `.env` uses SQLite for sessions, cache and the queue. To run with no database at all, set `SESSION_DRIVER=file`, `CACHE_STORE=file` and `QUEUE_CONNECTION=sync`.

## In this repository

The template is a pnpm workspace package that uses the workspace copy of the library (`workspace:*`). Build the library first, since the template imports its `dist`:

```bash
pnpm install
pnpm build                                                # the library
pnpm --filter onu-template-laravel-inertia-react build    # or `dev`
cd templates/laravel-inertia-react
composer install
cp .env.example .env && php artisan key:generate
touch database/database.sqlite && php artisan migrate
php artisan test
php artisan serve
```

This app was generated with `composer create-project laravel/laravel` and `composer require inertiajs/inertia-laravel`; `vendor/` and `node_modules/` are not committed.

<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ApplicationFormTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // The tests don't need built assets.
        $this->withoutVite();
    }

    public function test_the_dashboard_renders_the_admin_shell_page(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('<html lang="en" dir="ltr">', escape: false)
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('locale', 'en'));
    }

    public function test_the_form_page_lists_the_atolls(): void
    {
        $this->get('/applications/create')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('applications/create')
                ->has('atolls', 4)
                ->where('atolls.0', ['value' => 'K', 'label' => 'Kaafu']));
    }

    public function test_an_empty_form_returns_an_error_for_every_required_field(): void
    {
        $this->from('/applications/create')
            ->post('/applications', [])
            ->assertRedirect('/applications/create')
            ->assertSessionHasErrors(['name', 'email', 'atoll', 'reason']);
    }

    public function test_invalid_values_return_laravel_validation_messages(): void
    {
        $this->from('/applications/create')
            ->post('/applications', [
                'name' => 'Aishath Shifa',
                'email' => 'not-an-email',
                'atoll' => 'X',
                'reason' => 'short',
            ])
            ->assertRedirect('/applications/create')
            ->assertSessionHasErrors([
                'email' => 'The email field must be a valid email address.',
                'atoll' => 'The selected atoll is invalid.',
                'reason' => 'The reason field must be at least 10 characters.',
            ])
            ->assertSessionDoesntHaveErrors('name');
    }

    public function test_inertia_receives_the_errors_as_page_props(): void
    {
        $this->from('/applications/create')->post('/applications', ['name' => 'Aishath Shifa']);

        $this->get('/applications/create')
            ->assertInertia(fn (Assert $page) => $page
                ->where('errors.email', 'The email field is required.')
                ->missing('errors.name'));
    }

    public function test_a_valid_application_redirects_to_the_dashboard_with_a_message(): void
    {
        $this->post('/applications', [
            'name' => 'Aishath Shifa',
            'email' => 'shifa@example.com',
            'atoll' => 'K',
            'reason' => 'Renewing my business permit.',
        ])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/')
            ->assertSessionHas('success', 'Application from Aishath Shifa received.');
    }

    public function test_switching_to_dhivehi_renders_right_to_left_with_dhivehi_messages(): void
    {
        $this->from('/')->post('/locale', ['locale' => 'dv'])->assertRedirect('/');

        $this->get('/')
            ->assertSee('<html lang="dv" dir="rtl">', escape: false)
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'dv'));

        $this->from('/applications/create')
            ->post('/applications', [])
            ->assertSessionHasErrors(['name' => 'ފުރިހަމަ ނަން ލިޔުއްވުން ލާޒިމު.']);
    }

    public function test_unknown_locales_are_rejected(): void
    {
        $this->post('/locale', ['locale' => 'fr'])->assertSessionHasErrors('locale');
    }
}

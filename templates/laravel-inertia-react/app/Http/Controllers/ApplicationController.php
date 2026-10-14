<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    /** Atolls offered by the form's select. */
    public const ATOLLS = ['K' => 'Kaafu', 'S' => 'Seenu', 'Gn' => 'Gnaviyani', 'L' => 'Laamu'];

    /**
     * Show the application form.
     */
    public function create(): Response
    {
        return Inertia::render('applications/create', [
            'atolls' => collect(self::ATOLLS)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values(),
        ]);
    }

    /**
     * Validate and "store" an application. Validation errors go back to the page
     * as Inertia's `errors` prop and Onu shows each one under its field.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'atoll' => ['required', Rule::in(array_keys(self::ATOLLS))],
            'reason' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        // Save the application here, e.g. Application::create($validated).

        return to_route('dashboard')->with('success', __('Application from :name received.', [
            'name' => $validated['name'],
        ]));
    }
}

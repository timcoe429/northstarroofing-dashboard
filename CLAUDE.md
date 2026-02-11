# Start Here

Before starting any work, read these files in order:

1. `/ai/context.md` - What this project is
2. `/ai/current_plan.md` - Where we are and what's next
3. `/ai/decisions.md` - Why we made certain choices

## Additional Reference Documentation

For detailed information, also reference:
- `.cursorrules` - Coding standards and project structure reference
- `docs/PROJECT-STRUCTURE.md` - Tech stack and file structure
- `docs/API-INTEGRATIONS.md` - Integration details and setup
- `docs/DATABASE.md` - Database schema and setup
- `docs/QUICK-START.md` - Local development setup
- `README.md` - Project overview and deployment

After reading, confirm what phase we're in and what the next task is.

## Architectural Principles

When proposing solutions, always consider maintainability and scalability alongside immediate functionality.

### Before Proposing a Solution, Ask:
- Is there a systemic way to solve this, or is it truly one-off?
- If this needs to happen in multiple places, can it be centralized?
- Will this decision make the codebase easier or harder to maintain?
- Does this create a clear pattern others can follow?
- How does this scale when we add more features?

### Watch Out For:
- Solutions that require manual repetition for each new feature
- Patterns that are easy to forget or get wrong
- Quick fixes that work now but don't scale
- Scattered logic that should be centralized

### Prioritize:
- Clear, obvious patterns that guide developers toward correct usage
- Centralized logic when it makes sense (but not when it doesn't)
- Flexibility when requirements vary by context
- Code organization that makes the right thing easy and the wrong thing hard

### Think in Layers
- Consider both client-side and server-side solutions
- Defense in depth is often better than a single point of control
- Layouts, middleware, and hooks each have their place

### Question the Obvious
The most direct solution isn't always the best solution. Take a moment to consider:
- Is there a structural approach that solves this more elegantly?
- What patterns does the framework provide for this use case?
- How would this look if we had 10x more of these?

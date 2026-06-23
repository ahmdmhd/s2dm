class DependencyCompositionError(ValueError):
    """Raised when dependency schemas cannot be composed because of unresolvable conflicts.

    Carries one message per conflict so callers can render them as a list (API) or a log block (CLI).
    """

    def __init__(self, messages: list[str]) -> None:
        self.messages = tuple(messages)
        combined_message = "\n".join(messages)
        super().__init__(combined_message)

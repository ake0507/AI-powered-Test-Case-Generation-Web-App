"""Intelligent test case generator - analyzes code/spec and produces test cases."""

import re
from dataclasses import dataclass


@dataclass
class GeneratedTestCase:
    title: str
    description: str
    expected_outcome: str


def _extract_functions(code: str) -> list[str]:
    patterns = [
        r"def\s+(\w+)\s*\(",
        r"function\s+(\w+)\s*\(",
        r"(?:public|private|protected)?\s*(?:static\s+)?(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?:\{|:)",
        r"(\w+)\s*:\s*(?:async\s+)?function",
    ]
    names = set()
    for pattern in patterns:
        for match in re.finditer(pattern, code):
            name = match.group(1)
            if name not in ("if", "for", "while", "switch", "catch", "constructor"):
                names.add(name)
    return list(names)[:15]


def _extract_classes(code: str) -> list[str]:
    patterns = [
        r"class\s+(\w+)",
        r"interface\s+(\w+)",
        r"struct\s+(\w+)",
    ]
    names = set()
    for pattern in patterns:
        for match in re.finditer(pattern, code):
            names.add(match.group(1))
    return list(names)[:10]


def _extract_api_routes(code: str) -> list[str]:
    patterns = [
        r"@(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*[\"']([^\"']+)[\"']",
        r"(?:GET|POST|PUT|DELETE|PATCH)\s+(/[\w/{}:-]+)",
    ]
    routes = []
    for pattern in patterns:
        for match in re.finditer(pattern, code, re.IGNORECASE):
            routes.append(match.group(0) if len(match.groups()) == 1 else f"{match.group(1).upper()} {match.group(2)}")
    return routes[:10]


def _extract_requirements(spec: str) -> list[str]:
    lines = [line.strip() for line in spec.splitlines() if line.strip()]
    requirements = []
    for line in lines:
        if re.match(r"^(?:\d+[\.\)]\s*|[-*]\s*|(?:Given|When|Then|As a|I want|I need))", line, re.I):
            requirements.append(line)
        elif len(line) > 20 and not line.startswith("//"):
            requirements.append(line)
    return requirements[:12]


def generate_test_cases(input_data: str) -> list[GeneratedTestCase]:
    """Generate test cases from code or specification using heuristic analysis."""
    test_cases: list[GeneratedTestCase] = []
    code = input_data.strip()

    if not code:
        return [
            GeneratedTestCase(
                title="Empty input validation",
                description="Submit non-empty code or specification",
                expected_outcome="System rejects empty submissions with validation error",
            )
        ]

    functions = _extract_functions(code)
    classes = _extract_classes(code)
    routes = _extract_api_routes(code)
    requirements = _extract_requirements(code)

    for fn in functions:
        test_cases.append(
            GeneratedTestCase(
                title=f"Test {fn} with valid inputs",
                description=f"Call {fn}() with typical valid arguments and verify correct return value or side effects.",
                expected_outcome=f"{fn} executes successfully and returns expected result for valid inputs.",
            )
        )
        test_cases.append(
            GeneratedTestCase(
                title=f"Test {fn} with invalid/null inputs",
                description=f"Call {fn}() with null, empty, or boundary invalid arguments.",
                expected_outcome=f"{fn} handles invalid inputs gracefully (raises appropriate error or returns safe default).",
            )
        )

    for cls in classes:
        test_cases.append(
            GeneratedTestCase(
                title=f"Test {cls} instantiation",
                description=f"Create an instance of {cls} with required constructor parameters.",
                expected_outcome=f"{cls} object is created with correct initial state.",
            )
        )
        test_cases.append(
            GeneratedTestCase(
                title=f"Test {cls} methods and properties",
                description=f"Exercise public methods and properties of {cls}.",
                expected_outcome="All public API methods behave according to class contract.",
            )
        )

    for route in routes:
        test_cases.append(
            GeneratedTestCase(
                title=f"API endpoint: {route}",
                description=f"Send HTTP request to {route} with valid payload and authentication.",
                expected_outcome="Endpoint returns 2xx status with correct response schema.",
            )
        )
        test_cases.append(
            GeneratedTestCase(
                title=f"API endpoint unauthorized: {route}",
                description=f"Send request to {route} without valid auth token.",
                expected_outcome="Endpoint returns 401 Unauthorized.",
            )
        )

    for i, req in enumerate(requirements):
        test_cases.append(
            GeneratedTestCase(
                title=f"Requirement {i + 1}: acceptance test",
                description=f"Verify requirement: {req[:200]}",
                expected_outcome="System behavior satisfies the stated requirement.",
            )
        )

    if "login" in code.lower() or "auth" in code.lower():
        test_cases.extend([
            GeneratedTestCase(
                title="Authentication - valid credentials",
                description="Submit correct email and password combination.",
                expected_outcome="User is authenticated and receives valid session/token.",
            ),
            GeneratedTestCase(
                title="Authentication - invalid credentials",
                description="Submit incorrect password for existing user.",
                expected_outcome="Authentication fails with appropriate error message.",
            ),
        ])

    if "password" in code.lower():
        test_cases.append(
            GeneratedTestCase(
                title="Password strength validation",
                description="Attempt registration with weak password (too short, no special chars).",
                expected_outcome="System rejects weak passwords with validation feedback.",
            )
        )

    if not test_cases:
        test_cases = [
            GeneratedTestCase(
                title="Happy path - primary functionality",
                description="Execute the main workflow with valid, typical user input.",
                expected_outcome="System completes the primary operation successfully.",
            ),
            GeneratedTestCase(
                title="Edge case - empty input",
                description="Submit empty or minimal input to the system.",
                expected_outcome="System handles empty input without crashing.",
            ),
            GeneratedTestCase(
                title="Edge case - boundary values",
                description="Test with minimum and maximum allowed input values.",
                expected_outcome="System correctly processes boundary values.",
            ),
            GeneratedTestCase(
                title="Error handling - malformed input",
                description="Submit intentionally malformed or unexpected input format.",
                expected_outcome="System returns clear error message without exposing internals.",
            ),
            GeneratedTestCase(
                title="Concurrency - simultaneous requests",
                description="Send multiple concurrent requests for the same operation.",
                expected_outcome="System maintains data integrity under concurrent access.",
            ),
        ]

    seen = set()
    unique: list[GeneratedTestCase] = []
    for tc in test_cases:
        key = tc.title.lower()
        if key not in seen:
            seen.add(key)
            unique.append(tc)

    return unique[:25]

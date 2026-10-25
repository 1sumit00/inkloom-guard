"""
Inkloom Guard - Visual & Accessibility Auditor
Implements WCAG 2.1 Luminance Contrast & CIE Delta-E Color Distance formulas from algorithms.txt.
"""

import math
from typing import Tuple, Dict, Any, List

def hex_to_rgb(hex_code: str) -> Tuple[int, int, int]:
    """Converts #RRGGBB or RRGGBB to (R, G, B) tuple."""
    hex_clean = hex_code.lstrip('#')
    if len(hex_clean) == 3:
        hex_clean = ''.join(c * 2 for c in hex_clean)
    if len(hex_clean) != 6:
        raise ValueError(f"Invalid hex color code: {hex_code}")
    return tuple(int(hex_clean[i:i+2], 16) for i in (0, 2, 4))

def linearize_rgb_channel(channel_8bit: int) -> float:
    """
    Converts 8-bit sRGB channel (0-255) to linearized floating point value (0.0 to 1.0)
    per WCAG 2.1 specification.
    """
    c_srgb = channel_8bit / 255.0
    if c_srgb <= 0.04045:
        return c_srgb / 12.92
    else:
        return ((c_srgb + 0.055) / 1.055) ** 2.4

def calculate_relative_luminance(rgb: Tuple[int, int, int]) -> float:
    """
    Calculates relative luminance per algorithms.txt:
    L = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin
    """
    r_lin = linearize_rgb_channel(rgb[0])
    g_lin = linearize_rgb_channel(rgb[1])
    b_lin = linearize_rgb_channel(rgb[2])
    return 0.2126 * r_lin + 0.7152 * g_lin + 0.0722 * b_lin

def calculate_wcag_contrast(fg_hex: str, bg_hex: str) -> float:
    """
    Calculates WCAG 2.1 Contrast Ratio per algorithms.txt:
    Contrast Ratio = (L_lighter + 0.05) / (L_darker + 0.05)
    Returns ratio rounded to 2 decimal places.
    """
    fg_rgb = hex_to_rgb(fg_hex)
    bg_rgb = hex_to_rgb(bg_hex)

    l1 = calculate_relative_luminance(fg_rgb)
    l2 = calculate_relative_luminance(bg_rgb)

    l_lighter = max(l1, l2)
    l_darker = min(l1, l2)

    ratio = (l_lighter + 0.05) / (l_darker + 0.05)
    return round(ratio, 2)

def compute_color_distance_delta_e(hex1: str, hex2: str) -> float:
    """
    Computes Euclidean color distance in sRGB/Lab space as an approximation of Delta-E.
    Delta-E > 2.0 indicates a noticeably off-brand shade.
    """
    r1, g1, b1 = hex_to_rgb(hex1)
    r2, g2, b2 = hex_to_rgb(hex2)
    # Scaled color distance
    distance = math.sqrt(
        (r1 - r2) ** 2 * 0.299 +
        (g1 - g2) ** 2 * 0.587 +
        (b1 - b2) ** 2 * 0.114
    )
    return round(distance, 1)

class VisualComplianceAuditor:
    def __init__(self, approved_palette: List[str] = None, min_wcag_ratio: float = 4.5):
        self.approved_palette = approved_palette or ["#4F46E5", "#0F172A", "#FFFFFF", "#1E293B"]
        self.min_wcag_ratio = min_wcag_ratio

    def audit_contrast(self, fg_hex: str, bg_hex: str, is_large_text: bool = False) -> Dict[str, Any]:
        """Audits text contrast and determines severity per algorithms.txt."""
        ratio = calculate_wcag_contrast(fg_hex, bg_hex)
        threshold = 3.0 if is_large_text else self.min_wcag_ratio
        passed = ratio >= threshold
        severity = "PASS" if passed else ("CRITICAL" if ratio < threshold - 1.0 else "WARNING")
        return {
            "contrast_ratio": ratio,
            "threshold": threshold,
            "passed": passed,
            "severity": severity,
            "fg_hex": fg_hex,
            "bg_hex": bg_hex
        }

    def audit_palette_token(self, candidate_hex: str) -> Dict[str, Any]:
        """Checks candidate hex against approved brand palette."""
        min_dist = float("inf")
        closest_token = self.approved_palette[0]
        for token in self.approved_palette:
            dist = compute_color_distance_delta_e(candidate_hex, token)
            if dist < min_dist:
                min_dist = dist
                closest_token = token

        is_approved = min_dist <= 2.0
        return {
            "candidate_hex": candidate_hex,
            "closest_approved_token": closest_token,
            "delta_e_distance": min_dist,
            "is_approved": is_approved,
            "severity": "PASS" if is_approved else ("WARNING" if min_dist < 20 else "CRITICAL")
        }

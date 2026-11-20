/**
 * Tiện ích hỗ trợ cuộn và làm nổi bật câu hỏi bắt buộc chưa điền trong biểu mẫu khảo sát.
 */

interface ScrollOptions {
  focus?: boolean;
  offset?: number;
  highlightDuration?: number;
}

/**
 * Cuộn mượt mà vùng chứa khảo sát (#survey-scroll-container) đến câu hỏi bị thiếu thông tin bắt buộc,
 * đồng thời kích hoạt hiệu ứng nhấp nháy thị giác để người dùng nhận biết ngay lập tức.
 * 
 * @param elementId ID của phần tử câu hỏi hoặc ô nhập liệu trong DOM
 * @param options Tùy chọn bổ sung (offset, focus, thời gian highlight)
 */
export function scrollToQuestion(elementId: string, options: ScrollOptions = {}): void {
  if (typeof window === "undefined" || !elementId) return;

  const target = document.getElementById(elementId);
  if (!target) return;

  const { focus = true, offset = 24, highlightDuration = 2800 } = options;
  const container = document.getElementById("survey-scroll-container");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (container) {
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    // Vị trí mục tiêu so với đỉnh vùng cuộn nội bộ
    const targetScrollTop = targetRect.top - containerRect.top + container.scrollTop - offset;

    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  } else {
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  // Khởi động lại hiệu ứng nhấp nháy thị giác (CSS class survey-required-highlight)
  target.classList.remove("survey-required-highlight");
  // Force DOM reflow để animation restart ngay cả khi người dùng nhấn submit nhiều lần
  void target.offsetWidth;
  target.classList.add("survey-required-highlight");

  setTimeout(() => {
    target.classList.remove("survey-required-highlight");
  }, highlightDuration);

  // Tự động focus vào trường nhập liệu hoặc điều khiển tương tác đầu tiên
  if (focus) {
    setTimeout(() => {
      const focusable = target.querySelector<HTMLElement>(
        "select:not([disabled]), input:not([type='hidden']):not([disabled]), textarea:not([disabled]), button:not([disabled])"
      );
      if (focusable) {
        focusable.focus({ preventScroll: true });
      }
    }, prefersReducedMotion ? 30 : 320);
  }
}

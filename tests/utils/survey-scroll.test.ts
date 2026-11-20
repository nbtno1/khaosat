import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { scrollToQuestion } from "../../src/lib/survey-scroll";

describe("TÍNH NĂNG TỰ ĐỘNG CUỘN ĐẾN CÂU HỎI BẮT BUỘC (SURVEY AUTO-SCROLL)", () => {
  test("TC-SCROLL-01: Hoạt động an toàn trong môi trường SSR (window is undefined)", () => {
    // Khi gọi trong môi trường Node / Server-Side Rendering
    assert.doesNotThrow(() => {
      scrollToQuestion("question-1");
      scrollToQuestion("");
      scrollToQuestion("non-existent-id");
    });
  });

  test("TC-SCROLL-02: Cuộn container nội bộ và gắn class highlight khi chạy trên trình duyệt", () => {
    // Giả lập DOM trình duyệt
    let scrolledTop: number | null = null;
    let scrolledBehavior: string | null = null;
    let focused = false;

    const mockClasses = new Set<string>();

    const mockTarget = {
      id: "question-1",
      classList: {
        add: (cls: string) => mockClasses.add(cls),
        remove: (cls: string) => mockClasses.delete(cls),
        contains: (cls: string) => mockClasses.has(cls),
      },
      offsetWidth: 500,
      getBoundingClientRect: () => ({ top: 350, bottom: 450, height: 100 }),
      querySelector: () => ({
        focus: () => {
          focused = true;
        },
      }),
      scrollIntoView: () => {},
    };

    const mockContainer = {
      scrollTop: 100,
      getBoundingClientRect: () => ({ top: 50, bottom: 650, height: 600 }),
      scrollTo: ({ top, behavior }: { top: number; behavior: string }) => {
        scrolledTop = top;
        scrolledBehavior = behavior;
      },
    };

    // Gán mock window & document
    const originalWindow = global.window;
    const originalDocument = global.document;

    try {
      (global as any).window = {
        matchMedia: () => ({ matches: false }),
      };
      (global as any).document = {
        getElementById: (id: string) => {
          if (id === "question-1") return mockTarget;
          if (id === "survey-scroll-container") return mockContainer;
          return null;
        },
      };

      scrollToQuestion("question-1", { offset: 20 });

      // Kiểm tra container được cuộn chính xác
      // relativeTop = targetRect.top (350) - containerRect.top (50) + container.scrollTop (100) - offset (20) = 380
      assert.equal(scrolledTop, 380);
      assert.equal(scrolledBehavior, "smooth");

      // Kiểm tra class highlight được gắn vào phần tử
      assert.equal(mockClasses.has("survey-required-highlight"), true);
    } finally {
      (global as any).window = originalWindow;
      (global as any).document = originalDocument;
    }
  });

  test("TC-SCROLL-03: Tương thích với cài đặt giảm chuyển động (prefers-reduced-motion)", () => {
    let scrolledBehavior: string | null = null;

    const mockTarget = {
      classList: { add: () => {}, remove: () => {} },
      offsetWidth: 100,
      getBoundingClientRect: () => ({ top: 200 }),
      querySelector: () => null,
    };

    const mockContainer = {
      scrollTop: 0,
      getBoundingClientRect: () => ({ top: 0 }),
      scrollTo: ({ behavior }: { behavior: string }) => {
        scrolledBehavior = behavior;
      },
    };

    const originalWindow = global.window;
    const originalDocument = global.document;

    try {
      (global as any).window = {
        matchMedia: (query: string) => ({ matches: query.includes("prefers-reduced-motion") }),
      };
      (global as any).document = {
        getElementById: (id: string) => (id === "test-wg" ? mockTarget : mockContainer),
      };

      scrollToQuestion("test-wg");
      assert.equal(scrolledBehavior, "auto");
    } finally {
      (global as any).window = originalWindow;
      (global as any).document = originalDocument;
    }
  });
});

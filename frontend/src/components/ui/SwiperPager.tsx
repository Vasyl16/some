import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Button } from "./Button";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function SwiperPager({ page, totalPages, onChange }: Props) {
  const slides = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);
  const initialSlide = Math.min(Math.max(page - 1, 0), Math.max(totalPages - 1, 0));

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-3 rounded-2xl border border-white/60 bg-white/60 p-3 backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Page <span className="font-semibold text-slate-900">{page}</span> / {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onChange(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        slidesPerView={Math.min(7, totalPages)}
        spaceBetween={8}
        initialSlide={initialSlide}
        centeredSlides={totalPages > 7}
        pagination={{ clickable: true }}
        onSlideChange={(swiper) => onChange(swiper.activeIndex + 1)}
      >
        {slides.map((p) => (
          <SwiperSlide key={p}>
            <button
              type="button"
              onClick={() => onChange(p)}
              className={[
                "w-full rounded-xl border px-3 py-2 text-sm font-semibold transition",
                p === page
                  ? "border-indigo-300 bg-indigo-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {p}
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}


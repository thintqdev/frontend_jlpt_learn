"use client";

import { ReactNode, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  BookOpen,
  MessageCircle,
  Volume2,
  ArrowLeft,
} from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  };
  stats?: Array<{
    value: string | number;
    label: string;
  }>;
  search?: {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
  };
  filters?: ReactNode;
  levelFilters?: {
    levels: string[];
    selectedLevel: string;
    onLevelChange: (level: string) => void;
  };
  backButton?: {
    onClick: () => void;
  };
  actions?: ReactNode;
  variant?: "default" | "gradient" | "minimal";
}

export default memo(function PageHeader({
  title,
  subtitle,
  icon,
  badge,
  stats,
  search,
  filters,
  levelFilters,
  backButton,
  actions,
  variant = "default",
}: PageHeaderProps) {
  const getHeaderClasses = () => {
    switch (variant) {
      case "gradient":
        return "bg-gradient-to-br from-rose-500 to-rose-700 text-white px-4 sm:px-6 py-6 sm:py-8 shadow-md";
      case "minimal":
        return "px-4 sm:px-6 pt-8 sm:pt-10 pb-4 sm:pb-6 border-b border-gray-100";
      default:
        return "px-4 sm:px-6 pt-10 sm:pt-12 pb-4 sm:pb-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50";
    }
  };

  const getTitleClasses = () => {
    switch (variant) {
      case "gradient":
        return "text-xl sm:text-2xl font-bold";
      case "minimal":
        return "text-lg sm:text-xl md:text-2xl font-bold text-gray-900";
      default:
        return "text-xl sm:text-2xl font-bold text-gray-900";
    }
  };

  const getSubtitleClasses = () => {
    switch (variant) {
      case "gradient":
        return "text-sm text-rose-100";
      default:
        return "text-sm text-gray-600";
    }
  };

  return (
    <div className={getHeaderClasses()}>
      {/* Back Button */}
      {backButton && (
        <div className="mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={backButton.onClick}
            className={`hover:bg-gray-100 transition ${
              variant === "gradient"
                ? "border-white/20 text-white hover:bg-white/10"
                : ""
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <div className="min-w-0 flex-1">
            <h1 className={getTitleClasses()}>{title}</h1>
            {subtitle && <p className={getSubtitleClasses()}>{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
          {badge && (
            <Badge
              variant={badge.variant || "secondary"}
              className={
                variant === "gradient"
                  ? "bg-white/20 text-white border-white/30"
                  : badge.className
              }
            >
              {badge.text}
            </Badge>
          )}
          {actions}
        </div>
      </div>

      {/* Stats Grid */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-sm mb-4 sm:mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="px-2 py-2 sm:px-0 sm:py-0">
              <div
                className={`text-lg sm:text-xl font-bold ${
                  variant === "gradient" ? "text-white" : "text-gray-900"
                }`}
              >
                {stat.value}
              </div>
              <div
                className={`text-xs sm:text-sm ${
                  variant === "gradient" ? "text-rose-100" : "text-gray-600"
                }`}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {search && (
        <div className="mb-4">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                variant === "gradient" ? "text-white/70" : "text-gray-400"
              }`}
            />
            <Input
              placeholder={search.placeholder}
              className={`pl-10 h-10 sm:h-11 text-base ${
                variant === "gradient"
                  ? "bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white/40"
                  : "border-gray-200 focus:border-primary-300"
              }`}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Level Filters */}
      {levelFilters && (
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
          {levelFilters.levels.map((level) => (
            <Button
              key={level}
              variant={
                levelFilters.selectedLevel === level ? "default" : "outline"
              }
              size="sm"
              onClick={() => levelFilters.onLevelChange(level)}
              className={`snap-start whitespace-nowrap flex-shrink-0 px-3 py-2 h-9 text-sm ${
                levelFilters.selectedLevel === level
                  ? variant === "gradient"
                    ? "bg-white text-rose-600 hover:bg-white/90"
                    : "bg-rose-600 hover:bg-rose-700"
                  : variant === "gradient"
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {level}
            </Button>
          ))}
        </div>
      )}

      {/* Custom Filters */}
      {filters}
    </div>
  );
});

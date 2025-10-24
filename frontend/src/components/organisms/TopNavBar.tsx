import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../atoms/Button";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Globe, Check } from "lucide-react";

interface TopNavBarProps {
  className?: string;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loginUser, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);

  const handleBrandClick = () => {
    navigate("/");
  };

  const handleLogin = async () => {
    try {
      const result = await loginUser();
      if (result.success) {
        console.log("登录成功:", result.user);
      } else {
        console.error("登录失败:", result.error);
      }
    } catch (error) {
      console.error("登录出错:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log("登出成功");
      navigate("/");
    } catch (error) {
      console.error("登出出错:", error);
    }
  };

  const handlePersonalCenterClick = () => {
    navigate("/personal");
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLangOpen(false);
  };

  return (
    <nav className={`nav-bar ${className}`}>
      <div
        className="nav-brand"
        onClick={handleBrandClick}
        style={{ cursor: "pointer" }}
      >
        <span className="brand-text">Teamie</span>
      </div>

      <div className="nav-actions flex items-center gap-3">
        <Popover open={langOpen} onOpenChange={setLangOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">
                {i18n.language === "en" ? t("language.english") : t("language.chinese")}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => changeLanguage("en")}
                className={`flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors ${
                  i18n.language === "en" ? "bg-muted font-medium" : ""
                }`}
              >
                <span>{t("language.english")}</span>
                {i18n.language === "en" && <Check className="w-4 h-4 text-primary" />}
              </button>
              <button
                onClick={() => changeLanguage("zh")}
                className={`flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors ${
                  i18n.language === "zh" ? "bg-muted font-medium" : ""
                }`}
              >
                <span>{t("language.chinese")}</span>
                {i18n.language === "zh" && <Check className="w-4 h-4 text-primary" />}
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Button onClick={handleBrandClick} variant="ghost" size="sm">
              {t("home")}
            </Button>
            <Button
              onClick={handlePersonalCenterClick}
              variant="default"
              size="sm"
            >
              {user?.name}
            </Button>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              {t("logout")}
            </Button>
          </div>
        ) : (
          <Button onClick={handleLogin} variant="ghost" size="sm">
            {t("login")}
          </Button>
        )}
      </div>
    </nav>
  );
};

export default TopNavBar;

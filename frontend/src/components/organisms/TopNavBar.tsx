import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../atoms/Button";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";

interface TopNavBarProps {
  className?: string;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loginUser, logout } = useAuth();
  const { t, i18n } = useTranslation();

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

  const toggleLanguage = () => {
    const nextLang = i18n.language === "en" ? "zh" : "en";
    i18n.changeLanguage(nextLang);
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
        <Button onClick={toggleLanguage} variant="outline" size="sm">
          {t("language.current")}
        </Button>

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

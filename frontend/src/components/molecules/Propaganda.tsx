import React from "react";
import { useTranslation } from "react-i18next";

const Propaganda: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="card bg-yellow-100 border-l-4 border-yellow-500 shadow-md mx-auto my-8">
      <div className="card-header text-center">
        <p className="card-description text-yellow-900 whitespace-pre-line mt-2">
          {t("propaganda.message")
            .split("\n")
            .map((line, idx) => {
              const parts = line.split("?");
              return (
                <span
                  key={idx}
                  className="block text-2xl md:text-3xl font-medium"
                >
                  {parts.map((part, i) =>
                    i < parts.length - 1 ? (
                      <>
                        {part}
                        <span className="text-yellow-700 font-bold">?</span>
                      </>
                    ) : (
                      part
                    ),
                  )}
                </span>
              );
            })}
        </p>
      </div>
    </div>
  );
};

export default Propaganda;

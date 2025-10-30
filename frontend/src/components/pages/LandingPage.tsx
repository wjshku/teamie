import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface LandingPageProps {
  onNavigateToCreate: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToCreate }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-muted via-background to-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            {t('landing.brandTitle')}
          </h1>

          <div className="space-y-8">
            <div className="max-w-[700px] mx-auto">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-6 text-center">
                {t('landing.hero.title')}
              </h2>
              <div className="text-left space-y-4">
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {t('landing.hero.subtitle')}
                </p>
                <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed text-center">
                  {t('landing.hero.cta')}
                </p>
              </div>
              <div className="mt-8 text-center">
                <Button
                  onClick={onNavigateToCreate}
                  size="lg"
                  className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  👉 {t('landing.hero.button')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-card-foreground mb-12">
            {t('landing.solution.title')}
          </h2>

          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
            <div className="bg-gradient-to-br from-muted to-muted/50 p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
                  <span className="text-xl">💊</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {t('landing.solution.features.capsules.title')}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.solution.features.capsules.description')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-accent to-accent/50 p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                  <span className="text-xl">📥</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {t('landing.solution.features.import.title')}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.solution.features.import.description')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-muted to-muted/50 p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {t('landing.solution.features.summaries.title')}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.solution.features.summaries.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;

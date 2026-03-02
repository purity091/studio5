
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DesignState, ThemeColors } from './types';
import { generateEconomicHeadlines } from './services/geminiService';
import { toPng } from 'html-to-image';

// --- Sub-components (Internal Helpers) ---

const ColorPicker: React.FC<{ selected: string; onChange: (color: string) => void }> = ({ selected, onChange }) => {
  const colors = [
    { name: 'أزرق اقتصادي', value: ThemeColors.ECONOMIC_BLUE },
    { name: 'أخضر نمو', value: ThemeColors.PROFIT_GREEN },
    { name: 'ذهبي فاخر', value: ThemeColors.GOLD_ACCENT },
    { name: 'أحمر عاجل', value: ThemeColors.CRITICAL_RED },
    { name: 'أسود عصري', value: ThemeColors.MODERN_BLACK },
    { name: 'بنفسجي ملكي', value: ThemeColors.ROYAL_PURPLE },
    { name: 'تيل محيطي', value: ThemeColors.OCEAN_TEAL },
    { name: 'رمادي صلب', value: ThemeColors.SLATE_GREY },
  ];

  return (
    <div className="color-picker-grid">
      {colors.map((c) => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          className={`color-button ${selected === c.value ? 'active' : ''}`}
          style={{ backgroundColor: c.value }}
          title={c.name}
        />
      ))}
    </div>
  );
};

const RangeControl: React.FC<{ label: string; value: number; min: number; max: number; onChange: (val: number) => void; unit?: string }> = ({ label, value, min, max, onChange, unit }) => (
  <div className="range-container">
    <div className="range-header">
      <label className="range-label">{label}</label>
      <span className="range-value">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="range-input"
    />
  </div>
);

// --- Constants ---

const PREDEFINED_LOGOS = [
  { id: 'main', name: 'شعار رئيسي', url: '/logos/Logo.svg' },
  { id: 'white', name: 'شعار أبيض', url: '/logos/alinvestor white.svg' },
  { id: 'alt1', name: 'شعار بديل 1', url: '/logos/Logo (1).svg' },
  { id: 'alt2', name: 'شعار بديل 2', url: '/logos/Logo (2).svg' },
];

// --- Sub-components (Internal Helpers) ---

const App: React.FC = () => {
  const [design, setDesign] = useState<DesignState>({
    headline: 'أدخل العنوان الاقتصادي هنا ليكون جذاباً للمتابعين',
    category: 'عاجل',
    source: 'منصة المستثمر الاقتصادية',
    imageUrl: 'https://picsum.photos/800/800?business',
    logoUrl: '/logos/alinvestor white.svg',
    themeColor: ThemeColors.ECONOMIC_BLUE,
    layout: 'overlay',
    overlayOpacity: 0.7,
    fontSize: 36,
    imageBrightness: 100,
    imageContrast: 100,
    customCss: '',
  });

  const [loadingAI, setLoadingAI] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  // Manually load fonts to avoid "CSSStyleSheet.cssRules" CORS errors in html-to-image
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const response = await fetch('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');
        const cssText = await response.text();
        const style = document.createElement('style');
        style.innerHTML = cssText;
        document.head.appendChild(style);
      } catch (error) {
        console.error("Failed to load fonts manually:", error);
      }
    };
    loadFonts();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDesign(prev => ({ ...prev, imageUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDesign(prev => ({ ...prev, logoUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchAISuggestions = async () => {
    setLoadingAI(true);
    try {
      const results = await generateEconomicHeadlines(design.headline);
      setSuggestions(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  const downloadImage = useCallback(async () => {
    if (previewRef.current === null) return;
    try {
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        skipAutoScale: true
      });
      const link = document.createElement('a');
      link.download = `iqtisad-post-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    }
  }, [previewRef]);

  return (
    <div className="app-container">
      {/* Sidebar Editor */}
      <aside className="sidebar scrollbar-hide">
        <header className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">I</div>
            <h1 className="app-title">أقتصاد كانفاس</h1>
          </div>
          <p className="app-subtitle">صمم هويتك الاقتصادية بلمسة احترافية</p>
        </header>

        <div className="sidebar-content">
          {/* Theme & Layout */}
          <section>
            <label className="section-label">
              <span>🎨</span> اختر الثيم
            </label>
            <ColorPicker selected={design.themeColor} onChange={(color) => setDesign({ ...design, themeColor: color })} />
          </section>

          <section>
            <label className="section-label">
              <span>📐</span> نمط التصميم
            </label>
            <div className="layout-grid">
              {(['overlay', 'split', 'minimal'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setDesign({ ...design, layout: l })}
                  className={`layout-button ${design.layout === l ? 'active' : ''}`}
                >
                  {l === 'overlay' ? 'تغطية كاملة' : l === 'split' ? 'خبر مقسوم' : 'مينيمال'}
                </button>
              ))}
            </div>
          </section>

          {/* CSS Customize Section */}
          <section className="controls-card">
            <label className="section-label">
              <span>🎚️</span> تخصيص المظهر (CSS)
            </label>

            <RangeControl
              label="حجم الخط"
              value={design.fontSize}
              min={20} max={80}
              onChange={(v) => setDesign({ ...design, fontSize: v })}
              unit="px"
            />

            {design.layout === 'overlay' && (
              <RangeControl
                label="شفافية الخلفية"
                value={Math.round(design.overlayOpacity * 100)}
                min={0} max={100}
                onChange={(v) => setDesign({ ...design, overlayOpacity: v / 100 })}
                unit="%"
              />
            )}

            <div className="meta-grid mt-2">
              <RangeControl
                label="إضاءة الصورة"
                value={design.imageBrightness}
                min={50} max={150}
                onChange={(v) => setDesign({ ...design, imageBrightness: v })}
                unit="%"
              />
              <RangeControl
                label="تباين الصورة"
                value={design.imageContrast}
                min={50} max={150}
                onChange={(v) => setDesign({ ...design, imageContrast: v })}
                unit="%"
              />
            </div>
          </section>

          {/* Advanced CSS Editor */}
          <section className="advanced-editor-card">
            <label className="advanced-label">
              <span>محرر CSS المتقدم</span>
              <span className="dev-tag">DEV MODE</span>
            </label>
            <div className="class-hint">
              Classes: <span className="class-name">.poster-root</span>, <span className="class-name">.poster-headline</span>, <span className="class-name">.poster-category</span>, <span className="class-name">.poster-image</span>
            </div>
            <textarea
              value={design.customCss}
              onChange={(e) => setDesign({ ...design, customCss: e.target.value })}
              className="css-textarea"
              placeholder="/* اكتب كود CSS هنا لتخصيص التصميم... */&#10;.poster-headline {&#10;  text-shadow: 2px 2px 0 #000;&#10;}"
              spellCheck={false}
              dir="ltr"
            />
            <button
              onClick={() => setDesign({ ...design, customCss: '' })}
              className="reset-button"
            >
              إعادة تعيين CSS
            </button>
          </section>

          {/* Headline Input */}
          <section>
            <label className="section-label">العنوان الرئيسي</label>
            <textarea
              value={design.headline}
              onChange={(e) => setDesign({ ...design, headline: e.target.value })}
              className="headline-textarea"
              placeholder="اكتب العنوان هنا..."
            />
            <button
              onClick={fetchAISuggestions}
              disabled={loadingAI}
              className="ai-button"
            >
              {loadingAI ? 'جاري التوليد...' : '✨ اقتراح عناوين بالذكاء الاصطناعي'}
            </button>
            {suggestions.length > 0 && (
              <div className="suggestion-list">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setDesign({ ...design, headline: s })}
                    className="suggestion-button"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Media Uploads */}
          <section className="upload-grid">
            {/* Main Image */}
            <div>
              <label className="section-label">صورة الخبر</label>
              <div className="main-image-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="upload-overlay"
                />
                <div className="upload-content">
                  <div className="upload-icon">📷</div>
                  <p className="upload-text">اضغط لرفع صورة الخبر</p>
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <div className="logo-upload-header">
                <label className="section-label">شعار المنصة (اختياري)</label>
                {design.logoUrl && (
                  <button
                    onClick={() => setDesign(prev => ({ ...prev, logoUrl: null }))}
                    className="delete-logo"
                  >
                    حذف الشعار ✕
                  </button>
                )}
              </div>

              {/* Predefined Logos Selection */}
              <div className="predefined-logos-grid mb-3">
                {PREDEFINED_LOGOS.map((logo) => (
                  <button
                    key={logo.id}
                    onClick={() => setDesign({ ...design, logoUrl: logo.url })}
                    className={`logo-item-button ${design.logoUrl === logo.url ? 'active' : ''}`}
                    title={logo.name}
                  >
                    <img src={logo.url} alt={logo.name} className="logo-item-preview" onError={(e) => {
                      // Fallback if image doesn't exist yet
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target.parentElement as HTMLElement).innerText = logo.name[0];
                    }} />
                  </button>
                ))}
              </div>

              <div className="logo-upload-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="upload-overlay"
                />
                <div className="logo-preview-box">
                  {design.logoUrl ? (
                    <img src={design.logoUrl} alt="logo preview" className="logo-preview-image" />
                  ) : (
                    <span>🏷️</span>
                  )}
                </div>
                <div className="logo-upload-text-container">
                  <p className="logo-upload-title">اضغط لرفع اللوغو</p>
                  <p className="logo-upload-hint">يفضل PNG شفاف</p>
                </div>
              </div>
            </div>
          </section>

          {/* Categorization */}
          <section className="meta-grid">
            <div>
              <label className="section-label">التصنيف</label>
              <input
                type="text"
                value={design.category}
                onChange={(e) => setDesign({ ...design, category: e.target.value })}
                className="meta-input"
              />
            </div>
            <div>
              <label className="section-label">المصدر</label>
              <input
                type="text"
                value={design.source}
                onChange={(e) => setDesign({ ...design, source: e.target.value })}
                className="meta-input"
              />
            </div>
          </section>
        </div>

        {/* Sticky Footer Button */}
        <div className="sticky-footer">
          <button
            onClick={downloadImage}
            className="download-button"
          >
            <span>تحميل الصورة (PNG)</span>
            <svg className="download-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Preview Area */}
      <main className="preview-main">
        <div className="poster-wrapper">
          <div
            ref={previewRef}
            className="poster-root square-aspect"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            {/* Inject Custom CSS */}
            {design.customCss && (
              <style dangerouslySetInnerHTML={{ __html: design.customCss }} />
            )}

            {/* Background Image with Filters */}
            {design.imageUrl && (
              <img
                src={design.imageUrl}
                alt="Post background"
                className="poster-image"
                style={{
                  filter: `brightness(${design.imageBrightness}%) contrast(${design.imageContrast}%)`
                }}
                crossOrigin="anonymous"
              />
            )}

            {/* Layout Variants */}
            {design.layout === 'overlay' && (
              <div
                className="overlay-layout"
                style={{
                  background: `linear-gradient(to top, rgba(0,0,0,${design.overlayOpacity + 0.2}) 0%, rgba(0,0,0,${design.overlayOpacity}) 40%, transparent 100%)`
                }}
              >
                <div className="overlay-content">
                  <div className="category-row">
                    <span
                      className="poster-category"
                      style={{ backgroundColor: design.themeColor }}
                    >
                      {design.category}
                    </span>
                    <div className="category-line" style={{ backgroundColor: design.themeColor }}></div>
                  </div>
                  <h2
                    className="poster-headline"
                    style={{ fontSize: `${design.fontSize}px` }}
                  >
                    {design.headline}
                  </h2>
                  <div className="poster-footer">
                    <span className="poster-source">{design.source}</span>
                    <div className="flex items-center gap-1">
                      <span className="footer-tag">al-investor.com</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {design.layout === 'split' && (
              <div className="split-layout">
                <div className="split-spacer"></div>
                <div className="split-content">
                  <div
                    className="split-accent-line"
                    style={{ backgroundColor: design.themeColor }}
                  ></div>
                  <div className="split-category-wrapper">
                    <span
                      className="split-category"
                      style={{ backgroundColor: design.themeColor }}
                    >
                      {design.category}
                    </span>
                  </div>
                  <h2
                    className="poster-headline"
                    style={{ fontSize: `${design.fontSize}px` }}
                  >
                    {design.headline}
                  </h2>
                  <div className="split-footer">
                    <div className="split-logo-circle">
                      {design.logoUrl ? (
                        <img src={design.logoUrl} alt="Logo" className="split-logo-image" />
                      ) : (
                        <div className="split-logo-placeholder">IQ</div>
                      )}
                    </div>
                    <div>
                      <p className="split-source-name">{design.source}</p>
                      <p className="split-source-desc">Economic News Platform</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {design.layout === 'minimal' && (
              <div className="minimal-layout">
                <div
                  className="minimal-overlay"
                  style={{ backgroundColor: `rgba(0,0,0,${design.overlayOpacity})` }}
                ></div>
                <div className="minimal-content">
                  <div
                    className="minimal-accent"
                    style={{ backgroundColor: design.themeColor }}
                  ></div>
                  <h2
                    className="poster-headline arabic-stroke"
                    style={{ fontSize: `${design.fontSize + 4}px` }}
                  >
                    {design.headline}
                  </h2>
                  <div className="minimal-meta-badge">
                    <span className="minimal-badge-content">
                      {design.source} • {design.category}
                    </span>
                  </div>
                </div>
                {/* Branding footer */}
                <div className="minimal-branding">
                  <div className="minimal-branding-text">
                    I Q T I S A D — O F F I C I A L
                  </div>
                </div>
              </div>
            )}

            {/* Watermark/Logo overlay */}
            <div className="logo-badge-container">
              <div className={`logo-badge ${design.logoUrl ? '' : 'placeholder'}`}>

                {design.logoUrl ? (
                  <img
                    src={design.logoUrl}
                    alt="Brand Logo"
                    className="logo-badge-image"
                  />
                ) : (
                  <>
                    <div
                      className="logo-badge-icon"
                      style={{ backgroundColor: design.themeColor }}
                    >IQ</div>
                    <div className="logo-badge-text-stack">
                      <span className="logo-badge-main-text">CANVAS</span>
                      <span className="logo-badge-sub-text">NEWS</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
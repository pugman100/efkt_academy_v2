/* @ds-bundle: {"format":4,"namespace":"EFKTDesignSystem_b30f3d","components":[{"name":"Card","sourcePath":"components/cards/Card.jsx"},{"name":"DashedSection","sourcePath":"components/cards/DashedSection.jsx"},{"name":"ImageCard","sourcePath":"components/cards/ImageCard.jsx"},{"name":"QuoteBlock","sourcePath":"components/cards/QuoteBlock.jsx"},{"name":"ServiceCard","sourcePath":"components/cards/ServiceCard.jsx"},{"name":"StatCard","sourcePath":"components/cards/StatCard.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"SectionHeading","sourcePath":"components/core/SectionHeading.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"BarChart","sourcePath":"components/data/BarChart.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"CircleAction","sourcePath":"components/media/CircleAction.jsx"},{"name":"PlayButton","sourcePath":"components/media/PlayButton.jsx"},{"name":"VideoThumb","sourcePath":"components/media/VideoThumb.jsx"},{"name":"NavDropdown","sourcePath":"components/navigation/NavDropdown.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/cards/Card.jsx":"c2c9f8d64120","components/cards/DashedSection.jsx":"1108e791776e","components/cards/ImageCard.jsx":"6fe29527bc33","components/cards/QuoteBlock.jsx":"0124a78044ee","components/cards/ServiceCard.jsx":"7d002579e953","components/cards/StatCard.jsx":"9fad1352ff9c","components/core/Badge.jsx":"8c0f75ff3d3c","components/core/Button.jsx":"c42c96ac4187","components/core/Icon.jsx":"37d31e39abdb","components/core/IconButton.jsx":"179a0fe0c24d","components/core/Logo.jsx":"c81ec9df2bb5","components/core/SectionHeading.jsx":"a5e4c02dff59","components/core/Tag.jsx":"49611e045702","components/data/BarChart.jsx":"0d4e5a348ffe","components/data/DataTable.jsx":"09ed9b3b5779","components/feedback/Dialog.jsx":"399f3100bcea","components/feedback/Toast.jsx":"621681f4e0a9","components/feedback/Tooltip.jsx":"12e8af074add","components/forms/Checkbox.jsx":"f4539a26a87a","components/forms/Input.jsx":"f1ce4526151c","components/forms/Radio.jsx":"ab8b5737c246","components/forms/Select.jsx":"746af3a5e42f","components/forms/Switch.jsx":"e0d8eb1c4718","components/media/CircleAction.jsx":"c78244b06b6b","components/media/PlayButton.jsx":"04ba273bc59b","components/media/VideoThumb.jsx":"eb5ee6796b2f","components/navigation/NavDropdown.jsx":"0029fbdc2c4f","components/navigation/Tabs.jsx":"537e06083066","slides/Slides.jsx":"4557759ef2b3","ui_kits/website/Chrome.jsx":"e96faa7df97a","ui_kits/website/ContactForm.jsx":"221c4a0679da","ui_kits/website/ContentCreation.jsx":"ec853261f11e","ui_kits/website/Home.jsx":"46d3f77ba9f8","ui_kits/website/Resources.jsx":"622425f0bfb0"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.EFKTDesignSystem_b30f3d = window.EFKTDesignSystem_b30f3d || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/cards/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Base EFKT card: white or off-white, radius 20, 24-32px interior air, whisper-soft shadow. */
function Card({
  children,
  surface = 'white',
  padding = 24,
  bordered = true,
  shadow = true,
  image,
  imageAlt = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: surface === 'offwhite' ? 'var(--surface-card-alt)' : 'var(--surface-card)',
      borderRadius: 'var(--efkt-radius-card)',
      border: bordered ? '1px solid var(--border-default)' : 'none',
      boxShadow: shadow ? 'var(--efkt-shadow)' : 'none',
      overflow: 'hidden',
      ...style
    }
  }, rest), image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: imageAlt,
    style: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      display: 'block'
    }
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: padding + 'px'
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/Card.jsx", error: String((e && e.message) || e) }); }

// components/cards/DashedSection.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** The dashed section frame: 1px dashed #E2E2E2, radius 20, off-white fill,
 *  with a fully rounded coral button sitting on the top edge. Max 1-2 per deck. */
function DashedSection({
  label,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: 'relative',
      marginTop: '25px',
      ...style
    }
  }, rest), label ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '-25px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--efkt-coral)',
      color: 'var(--efkt-white)',
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-bold)',
      padding: '14px 32px',
      borderRadius: 'var(--efkt-radius-pill)',
      whiteSpace: 'nowrap'
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px dashed var(--border-dashed)',
      borderRadius: 'var(--efkt-radius-card)',
      background: 'var(--surface-section)',
      padding: '48px 32px 32px'
    }
  }, children));
}
Object.assign(__ds_scope, { DashedSection });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/DashedSection.jsx", error: String((e && e.message) || e) }); }

// components/cards/QuoteBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Customer quote. On a dark photo with a scrim, or on a Sand surface. */
function QuoteBlock({
  quote,
  name,
  company,
  image,
  surface = 'photo',
  size = 28,
  style,
  ...rest
}) {
  const onPhoto = surface === 'photo';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: 'relative',
      borderRadius: 'var(--efkt-radius-card)',
      overflow: 'hidden',
      background: onPhoto ? 'var(--efkt-deep-navy)' : 'var(--efkt-sand)',
      padding: onPhoto ? '96px 48px' : '48px',
      ...style
    }
  }, rest), onPhoto && image ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(12,14,57,0.75), rgba(12,14,57,0.25))'
    }
  })) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: '820px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: size + 'px',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      fontWeight: 'var(--efkt-weight-regular)',
      color: onPhoto ? 'var(--efkt-white)' : 'var(--efkt-navy)',
      margin: 0,
      textWrap: 'pretty'
    }
  }, quote), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-6)',
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-medium)',
      color: onPhoto ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)'
    }
  }, name, company ? ', ' + company : '')));
}
Object.assign(__ds_scope, { QuoteBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/QuoteBlock.jsx", error: String((e && e.message) || e) }); }

// components/cards/ServiceCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Service link card as used in Content creation / activation: icon, H3, one line, arrow. */
function ServiceCard({
  icon,
  title,
  body,
  href,
  surface = 'offwhite',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Tag = href ? 'a' : 'div';
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'block',
      textDecoration: 'none',
      background: surface === 'white' ? 'var(--surface-card)' : 'var(--surface-card-alt)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--efkt-radius-card)',
      padding: '28px',
      boxShadow: hover ? 'var(--efkt-shadow-hover)' : 'var(--efkt-shadow)',
      transition: 'box-shadow var(--efkt-duration) var(--efkt-ease)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '20px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: 'ph ph-' + (icon || 'camera'),
    style: {
      fontSize: '40px',
      color: 'var(--icon-primary)'
    }
  }), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-arrow-up-right",
    style: {
      fontSize: '20px',
      color: hover ? 'var(--efkt-coral)' : 'var(--efkt-navy)'
    }
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      marginTop: '24px',
      fontSize: 'var(--text-h3)',
      fontWeight: 'var(--efkt-weight-semibold)',
      color: 'var(--text-heading)'
    }
  }, title), body ? /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '12px',
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-thin)',
      lineHeight: 1.6,
      color: 'var(--text-muted)'
    }
  }, body) : null);
}
Object.assign(__ds_scope, { ServiceCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/ServiceCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/StatCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** KPI: number at min 60px in 800, unit at 60% of the number, label in 16px Muted under it. */
function StatCard({
  value,
  unit,
  label,
  tone = 'navy',
  size = 60,
  align = 'left',
  style,
  ...rest
}) {
  const color = tone === 'coral' ? 'var(--efkt-coral)' : 'var(--efkt-navy)';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      textAlign: align,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      color,
      fontSize: size + 'px',
      fontWeight: 'var(--efkt-weight-fat)',
      lineHeight: 'var(--lh-kpi)',
      letterSpacing: 'var(--ls-kpi)',
      display: 'flex',
      alignItems: 'baseline',
      gap: '4px',
      justifyContent: align === 'center' ? 'center' : 'flex-start'
    }
  }, value, unit ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: Math.round(size * 0.6) + 'px',
      fontWeight: 'var(--efkt-weight-regular)'
    }
  }, unit) : null), label ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-3)',
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-thin)',
      color: 'var(--text-muted)',
      lineHeight: 1.5
    }
  }, label) : null);
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Small status badge. Soft accent backgrounds only, always navy text. */
function Badge({
  children,
  tone = 'mint',
  style,
  ...rest
}) {
  const bg = {
    mint: 'var(--efkt-mint)',
    sand: 'var(--efkt-sand)',
    blush: 'var(--efkt-blush)',
    gold: 'var(--efkt-gold)',
    neutral: 'var(--efkt-offwhite)'
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-block',
      padding: '6px 14px',
      borderRadius: 'var(--efkt-radius-pill)',
      background: bg[tone],
      color: 'var(--efkt-navy)',
      fontSize: 'var(--text-micro)',
      fontWeight: 'var(--efkt-weight-medium)',
      lineHeight: 1.3,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  md: {
    fontSize: '16px',
    padding: '14px 32px',
    minHeight: '50px'
  },
  lg: {
    fontSize: '18px',
    padding: '20px 36px',
    minHeight: '60px'
  }
};

/** EFKT button. Always fully rounded ends (radius >= 25px / half height). */
function Button({
  variant = 'primary',
  size = 'md',
  href,
  children,
  iconRight,
  disabled,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontFamily: 'var(--efkt-font)',
    fontWeight: 'var(--efkt-weight-medium)',
    fontSize: s.fontSize,
    lineHeight: 'var(--lh-ui)',
    letterSpacing: 'var(--ls-ui)',
    padding: s.padding,
    minHeight: s.minHeight,
    borderRadius: 'var(--efkt-radius-pill)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'background var(--efkt-duration) var(--efkt-ease), color var(--efkt-duration) var(--efkt-ease), border-color var(--efkt-duration) var(--efkt-ease)',
    opacity: disabled ? 0.4 : 1
  };
  const variants = {
    primary: {
      background: hover && !disabled ? 'var(--efkt-coral-hover)' : 'var(--efkt-coral)',
      color: 'var(--text-on-coral)',
      fontWeight: 'var(--efkt-weight-bold)'
    },
    secondary: {
      background: 'transparent',
      color: hover && !disabled ? 'var(--efkt-coral-hover)' : 'var(--efkt-coral)',
      border: 'var(--efkt-border-width-btn) solid ' + (hover && !disabled ? 'var(--efkt-coral-hover)' : 'var(--efkt-coral)')
    },
    navy: {
      background: hover && !disabled ? 'var(--efkt-deep-navy)' : 'var(--efkt-navy)',
      color: 'var(--efkt-white)',
      fontWeight: 'var(--efkt-weight-medium)'
    },
    tertiary: {
      background: 'transparent',
      color: hover && !disabled ? 'var(--efkt-coral-hover)' : 'var(--efkt-coral)',
      padding: '0',
      minHeight: 'auto'
    },
    onPhoto: {
      background: hover ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.3)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: 'var(--efkt-white)',
      padding: '16px 28px'
    }
  };
  const Tag = href ? 'a' : 'button';
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onClick: disabled ? undefined : onClick,
    disabled: Tag === 'button' ? disabled : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      ...variants[variant],
      ...style
    }
  }, rest), children, iconRight ? /*#__PURE__*/React.createElement("i", {
    className: 'ph ph-' + iconRight,
    style: {
      fontSize: '20px'
    }
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Phosphor icon wrapper. Requires the Phosphor web font stylesheet on the page:
 *  <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css"> */
function Icon({
  name,
  size = 24,
  tone = 'secondary',
  weight = 'regular',
  style,
  ...rest
}) {
  const tones = {
    primary: 'var(--icon-primary)',
    secondary: 'var(--icon-secondary)',
    muted: 'var(--text-muted)',
    onDark: 'var(--efkt-white)'
  };
  const cls = weight === 'regular' ? 'ph' : 'ph-' + weight;
  return /*#__PURE__*/React.createElement("i", _extends({
    className: cls + ' ph-' + name,
    "aria-hidden": "true",
    style: {
      fontSize: size + 'px',
      lineHeight: 1,
      color: tones[tone] || tone,
      display: 'inline-block',
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Circular icon-only button. 40px default, 1.5px border or filled. */
function IconButton({
  icon = 'arrow-up-right',
  variant = 'outline',
  size = 40,
  label,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const variants = {
    outline: {
      background: 'transparent',
      border: 'var(--efkt-border-width-btn) solid var(--efkt-navy)',
      color: 'var(--efkt-navy)'
    },
    onPhoto: {
      background: hover ? 'rgba(255,255,255,0.2)' : 'transparent',
      border: 'var(--efkt-border-width-btn) solid var(--efkt-white)',
      color: 'var(--efkt-white)'
    },
    coral: {
      background: hover ? 'var(--efkt-coral-hover)' : 'var(--efkt-coral)',
      border: 'none',
      color: 'var(--efkt-white)'
    },
    soft: {
      background: 'var(--efkt-offwhite)',
      border: '1px solid var(--border-default)',
      color: 'var(--efkt-navy)'
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label || icon,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: size,
      height: size,
      minWidth: size,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      cursor: 'pointer',
      transition: 'background var(--efkt-duration) var(--efkt-ease)',
      ...variants[variant],
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("i", {
    className: 'ph ph-' + icon,
    style: {
      fontSize: Math.round(size * 0.45) + 'px'
    }
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/cards/ImageCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Bento tile: photo, dark scrim in the text half, white H3 + one line, circle arrow top-right. */
function ImageCard({
  image,
  title,
  body,
  height = 320,
  action = true,
  tag,
  href,
  style,
  ...rest
}) {
  const Tag = href ? 'a' : 'div';
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    style: {
      position: 'relative',
      display: 'block',
      height,
      borderRadius: 'var(--efkt-radius-card)',
      overflow: 'hidden',
      textDecoration: 'none',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, var(--scrim-to), var(--scrim-from) 65%)'
    }
  }), action ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 20,
      right: 20
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "arrow-up-right",
    variant: "onPhoto",
    label: title
  })) : null, tag ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 20,
      left: 20,
      padding: '8px 16px',
      borderRadius: 'var(--efkt-radius-pill)',
      background: 'rgba(255,255,255,0.3)',
      backdropFilter: 'blur(12px)',
      color: 'var(--efkt-white)',
      fontSize: 'var(--text-micro)',
      fontWeight: 'var(--efkt-weight-medium)'
    }
  }, tag) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 24,
      right: 24,
      bottom: 24
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: 'var(--efkt-white)',
      fontSize: 'var(--text-h3)',
      fontWeight: 'var(--efkt-weight-semibold)',
      margin: 0
    }
  }, title), body ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-thin)',
      lineHeight: 1.5,
      margin: '8px 0 0'
    }
  }, body) : null));
}
Object.assign(__ds_scope, { ImageCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/ImageCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const FILES = {
  primary: 'efkt-logo-primary.svg',
  white: 'efkt-logo-white.svg',
  monoNavy: 'efkt-logo-mono-navy.svg',
  monoWhite: 'efkt-logo-mono-hvid.svg',
  mark: 'efkt-maerke.svg',
  markMonoNavy: 'efkt-maerke-mono-navy.svg'
};

/** Inserts the official EFKT logo FILE. The mark is never drawn, typeset or generated.
 *  Wordmark aspect is locked at 2.985:1; the mark alone at 1:1.909. */
function Logo({
  variant = 'primary',
  width,
  base = '/assets/logo/',
  style,
  ...rest
}) {
  const isMark = variant === 'mark' || variant === 'markMonoNavy';
  const w = width || (isMark ? 32 : 140);
  return /*#__PURE__*/React.createElement("img", _extends({
    src: base + FILES[variant],
    alt: "EFKT",
    style: {
      width: w,
      height: isMark ? w * 1.909 : w / 2.985,
      display: 'block',
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionHeading.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const LEVELS = {
  hero: {
    fontSize: 'var(--text-hero)',
    lineHeight: 'var(--lh-hero)',
    letterSpacing: 'var(--ls-hero)',
    fat: 'var(--efkt-weight-fat)'
  },
  h1: {
    fontSize: 'var(--text-h1)',
    lineHeight: 'var(--lh-h1)',
    letterSpacing: 'var(--ls-h1)',
    fat: 'var(--efkt-weight-black)'
  },
  h2: {
    fontSize: 'var(--text-h2)',
    lineHeight: 'var(--lh-h2)',
    letterSpacing: 'var(--ls-h2)',
    fat: 'var(--efkt-weight-fat)'
  }
};

/** EFKT's signature two-weight heading: 800/900 for the key word, 300 Light for the rest.
 *  Same size, same colour — the weight does all the work. */
function SectionHeading({
  level = 'h2',
  thin,
  fat,
  thinAfter,
  align = 'left',
  tone = 'navy',
  eyebrow,
  style,
  ...rest
}) {
  const L = LEVELS[level] || LEVELS.h2;
  const Tag = level === 'h2' ? 'h2' : 'h1';
  const color = tone === 'onDark' ? 'var(--efkt-white)' : 'var(--text-heading)';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      textAlign: align,
      ...style
    }
  }, rest), eyebrow ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-micro)',
      fontWeight: 'var(--efkt-weight-medium)',
      letterSpacing: '0.02em',
      color: tone === 'onDark' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
      marginBottom: 'var(--space-3)'
    }
  }, eyebrow) : null, /*#__PURE__*/React.createElement(Tag, {
    style: {
      fontSize: L.fontSize,
      lineHeight: L.lineHeight,
      letterSpacing: L.letterSpacing,
      fontWeight: 'var(--efkt-weight-thin)',
      color,
      margin: 0,
      textWrap: 'pretty'
    }
  }, thin ? /*#__PURE__*/React.createElement("span", null, thin, " ") : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: L.fat
    }
  }, fat), thinAfter ? /*#__PURE__*/React.createElement("span", null, " ", thinAfter) : null));
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Fully rounded pill for service labels ("Drone", "360°") and filters. */
function Tag({
  children,
  tone = 'default',
  icon,
  active,
  onClick,
  style,
  ...rest
}) {
  const tones = {
    default: {
      background: 'var(--efkt-offwhite)',
      color: 'var(--efkt-navy)',
      border: '1px solid var(--border-default)'
    },
    coral: {
      background: 'var(--efkt-coral)',
      color: 'var(--efkt-white)',
      border: '1px solid var(--efkt-coral)'
    },
    outline: {
      background: 'transparent',
      color: 'var(--efkt-navy)',
      border: '1px solid var(--efkt-navy)'
    },
    onPhoto: {
      background: 'rgba(255,255,255,0.3)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: 'var(--efkt-white)',
      border: 'none'
    }
  };
  const t = active ? tones.coral : tones[tone];
  return /*#__PURE__*/React.createElement("span", _extends({
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      borderRadius: 'var(--efkt-radius-pill)',
      fontSize: 'var(--text-micro)',
      fontWeight: 'var(--efkt-weight-medium)',
      lineHeight: 1.3,
      cursor: onClick ? 'pointer' : 'default',
      whiteSpace: 'nowrap',
      transition: 'background var(--efkt-duration) var(--efkt-ease)',
      ...t,
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement("i", {
    className: 'ph ph-' + icon,
    style: {
      fontSize: '16px'
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/BarChart.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SERIES = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)'];

/** Column chart per EFKT chart rules: horizontal gridlines only, zero baseline,
 *  direct labels, 14px Muted axis labels, coral for the series that carries the point. */
function BarChart({
  data = [],
  height = 260,
  maxValue,
  unit = '',
  direct = true,
  style,
  ...rest
}) {
  const max = maxValue || Math.max(...data.map(d => d.value)) * 1.15 || 1;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height
    }
  }, ticks.map(t => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: t * 100 + '%',
      height: '1px',
      background: 'var(--chart-grid)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'flex-end',
      gap: 'var(--space-6)'
    }
  }, data.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: d.label,
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: '100%'
    }
  }, direct ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-micro)',
      fontWeight: 'var(--efkt-weight-semibold)',
      color: d.accent ? 'var(--efkt-coral)' : 'var(--efkt-navy)',
      marginBottom: '8px'
    }
  }, d.value, unit) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: '72px',
      height: d.value / max * 100 + '%',
      background: d.accent ? 'var(--chart-1)' : d.color || SERIES[i % 6],
      borderRadius: '10px 10px 0 0'
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-6)',
      marginTop: 'var(--space-3)'
    }
  }, data.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.label,
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 'var(--text-micro)',
      color: 'var(--text-muted)'
    }
  }, d.label))));
}
Object.assign(__ds_scope, { BarChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/BarChart.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Table: square cells (the one place radius is 0), 20px cell padding,
 *  Light Gray zebra rows, 1px horizontal rules only. */
function DataTable({
  columns = [],
  rows = [],
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("table", _extends({
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 'var(--efkt-text-body)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c,
    style: {
      textAlign: 'left',
      padding: '20px',
      fontSize: 'var(--text-micro)',
      fontWeight: 'var(--efkt-weight-semibold)',
      color: 'var(--text-muted)',
      borderBottom: '1px solid var(--border-default)'
    }
  }, c)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      background: i % 2 ? 'var(--surface-row)' : 'transparent'
    }
  }, r.map((cell, j) => /*#__PURE__*/React.createElement("td", {
    key: j,
    style: {
      padding: '20px',
      fontWeight: j === 0 ? 'var(--efkt-weight-medium)' : 'var(--efkt-weight-thin)',
      color: 'var(--text-body)',
      borderBottom: '1px solid var(--border-default)'
    }
  }, cell))))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Centred modal: white, radius 20, 32px air, Deep Navy scrim behind. */
function Dialog({
  open = true,
  title,
  children,
  footer,
  onClose,
  width = 520,
  style,
  ...rest
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(12,14,57,0.45)',
      padding: 'var(--space-5)',
      zIndex: 40
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    style: {
      width,
      maxWidth: '100%',
      background: 'var(--surface-card)',
      borderRadius: 'var(--efkt-radius-card)',
      boxShadow: '0 24px 64px rgba(12,14,57,0.18)',
      padding: '32px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--text-h3)',
      fontWeight: 'var(--efkt-weight-semibold)',
      color: 'var(--text-heading)',
      margin: 0
    }
  }, title), onClose ? /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    variant: "soft",
    size: 40,
    label: "Close",
    onClick: onClose
  }) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-5)',
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-thin)',
      lineHeight: 1.6,
      color: 'var(--text-body)'
    }
  }, children), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-7)',
      display: 'flex',
      gap: 'var(--space-3)',
      justifyContent: 'flex-end'
    }
  }, footer) : null));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Toast: white pill-ish card, radius 20, coral or green status dot, 20px air. */
function Toast({
  tone = 'success',
  title,
  body,
  onClose,
  style,
  ...rest
}) {
  const dot = tone === 'success' ? 'var(--efkt-green)' : tone === 'error' ? 'var(--efkt-coral)' : 'var(--efkt-navy)';
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--efkt-radius-card)',
      boxShadow: 'var(--efkt-shadow)',
      padding: '20px 24px',
      maxWidth: '420px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      minWidth: 12,
      borderRadius: '50%',
      background: dot,
      marginTop: '6px'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-semibold)',
      color: 'var(--text-heading)'
    }
  }, title), body ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: '4px',
      fontSize: 'var(--text-micro)',
      color: 'var(--text-muted)',
      lineHeight: 1.4
    }
  }, body) : null), onClose ? /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x",
    style: {
      fontSize: '18px'
    }
  })) : null);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Navy tooltip, radius 10, 14px white label. */
function Tooltip({
  label,
  children,
  placement = 'top',
  style,
  ...rest
}) {
  const [show, setShow] = React.useState(false);
  const pos = placement === 'bottom' ? {
    top: 'calc(100% + 10px)'
  } : {
    bottom: 'calc(100% + 10px)'
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: 'relative',
      display: 'inline-flex',
      ...style
    },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false)
  }, rest), children, show ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      ...pos,
      background: 'var(--efkt-navy)',
      color: 'var(--efkt-white)',
      fontSize: 'var(--text-micro)',
      fontWeight: 'var(--efkt-weight-regular)',
      padding: '10px 14px',
      borderRadius: 'var(--efkt-radius-play)',
      whiteSpace: 'nowrap',
      zIndex: 30
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Checkbox: 24px, radius 8, coral when checked. */
function Checkbox({
  label,
  checked,
  onChange,
  disabled,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'flex-start',
      gap: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: !!checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      minWidth: 24,
      borderRadius: '8px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: checked ? 'var(--efkt-coral)' : 'var(--efkt-white)',
      border: '1px solid ' + (checked ? 'var(--efkt-coral)' : 'var(--border-default)'),
      transition: 'background var(--efkt-duration) var(--efkt-ease)'
    }
  }, checked ? /*#__PURE__*/React.createElement("i", {
    className: "ph-bold ph-check",
    style: {
      fontSize: '14px',
      color: 'var(--efkt-white)'
    }
  }) : null), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-thin)',
      lineHeight: 1.5,
      color: 'var(--text-body)'
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Text field. Fully rounded like the buttons it sits next to; 20px interior air. */
function Input({
  label,
  hint,
  error,
  icon,
  type = 'text',
  multiline,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const border = error ? 'var(--efkt-coral)' : focus ? 'var(--efkt-navy)' : 'var(--border-default)';
  const Tag = multiline ? 'textarea' : 'input';
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-medium)',
      color: 'var(--text-heading)',
      marginBottom: 'var(--space-3)'
    }
  }, label) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'var(--efkt-white)',
      border: '1px solid ' + border,
      borderRadius: multiline ? 'var(--efkt-radius-card)' : 'var(--efkt-radius-pill)',
      padding: multiline ? '20px 24px' : '0 24px',
      minHeight: '50px',
      transition: 'border-color var(--efkt-duration) var(--efkt-ease)'
    }
  }, icon ? /*#__PURE__*/React.createElement("i", {
    className: 'ph ph-' + icon,
    style: {
      fontSize: '20px',
      color: 'var(--text-muted)'
    }
  }) : null, /*#__PURE__*/React.createElement(Tag, _extends({
    type: multiline ? undefined : type,
    rows: multiline ? 4 : undefined,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--efkt-font)',
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-thin)',
      color: 'var(--text-body)',
      padding: multiline ? 0 : '14px 0',
      resize: multiline ? 'vertical' : undefined,
      lineHeight: 1.5
    }
  }, rest))), hint || error ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 'var(--space-2)',
      fontSize: 'var(--text-micro)',
      color: error ? 'var(--efkt-coral)' : 'var(--text-muted)'
    }
  }, error || hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Radio: 24px circle, coral dot when selected. */
function Radio({
  label,
  checked,
  onChange,
  name,
  value,
  disabled,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "radio",
    name: name,
    value: value,
    checked: !!checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      minWidth: 24,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--efkt-white)',
      border: '1px solid ' + (checked ? 'var(--efkt-coral)' : 'var(--border-default)')
    }
  }, checked ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: 'var(--efkt-coral)'
    }
  }) : null), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-thin)',
      color: 'var(--text-body)'
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Native select with EFKT chrome (pill, coral caret). */
function Select({
  label,
  options = [],
  hint,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-medium)',
      color: 'var(--text-heading)',
      marginBottom: 'var(--space-3)'
    }
  }, label) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    style: {
      width: '100%',
      appearance: 'none',
      WebkitAppearance: 'none',
      minHeight: '50px',
      padding: '14px 52px 14px 24px',
      borderRadius: 'var(--efkt-radius-pill)',
      border: '1px solid var(--border-default)',
      background: 'var(--efkt-white)',
      fontFamily: 'var(--efkt-font)',
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-thin)',
      color: 'var(--text-body)',
      cursor: 'pointer',
      outline: 'none'
    }
  }, rest), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: typeof o === 'string' ? o : o.value,
    value: typeof o === 'string' ? o : o.value
  }, typeof o === 'string' ? o : o.label))), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-down",
    style: {
      position: 'absolute',
      right: '22px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '18px',
      color: 'var(--efkt-coral)',
      pointerEvents: 'none'
    }
  })), hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 'var(--space-2)',
      fontSize: 'var(--text-micro)',
      color: 'var(--text-muted)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Pill switch, coral when on. */
function Switch({
  label,
  checked,
  onChange,
  disabled,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '16px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch",
    checked: !!checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 52,
      height: 30,
      borderRadius: 'var(--efkt-radius-pill)',
      padding: '3px',
      background: checked ? 'var(--efkt-coral)' : 'var(--efkt-divider)',
      display: 'inline-flex',
      justifyContent: checked ? 'flex-end' : 'flex-start',
      transition: 'background var(--efkt-duration) var(--efkt-ease)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      borderRadius: '50%',
      background: 'var(--efkt-white)'
    }
  })), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-thin)',
      color: 'var(--text-body)'
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/media/CircleAction.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** 40px circle, 1.5px border, diagonal arrow — the "read more" marker on image cards. */
function CircleAction({
  tone = 'onPhoto',
  size = 40,
  label = 'Read more',
  style,
  ...rest
}) {
  const color = tone === 'onPhoto' ? 'var(--efkt-white)' : 'var(--efkt-navy)';
  return /*#__PURE__*/React.createElement("span", _extends({
    role: "img",
    "aria-label": label,
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      border: 'var(--efkt-border-width-btn) solid ' + color,
      color,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-arrow-up-right",
    style: {
      fontSize: Math.round(size * 0.45) + 'px'
    }
  }));
}
Object.assign(__ds_scope, { CircleAction });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/media/CircleAction.jsx", error: String((e && e.message) || e) }); }

// components/media/PlayButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Coral play button, 48-64px, every corner and the triangle's tips rounded ~10px. */
function PlayButton({
  size = 56,
  onClick,
  label = 'Play',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const t = size * 0.34;
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: size,
      height: size,
      border: 'none',
      cursor: 'pointer',
      borderRadius: 'var(--efkt-radius-play)',
      background: hover ? 'var(--efkt-coral-hover)' : 'var(--efkt-coral)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background var(--efkt-duration) var(--efkt-ease)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    width: t,
    height: t,
    viewBox: "0 0 24 24",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 4.5 L19 12 L6 19.5 Z",
    fill: "var(--efkt-white)",
    stroke: "var(--efkt-white)",
    strokeWidth: "4",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  })));
}
Object.assign(__ds_scope, { PlayButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/media/PlayButton.jsx", error: String((e && e.message) || e) }); }

// components/media/VideoThumb.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Video thumbnail with scrim, centred play button and an optional caption inside the frame. */
function VideoThumb({
  image,
  quote,
  name,
  height = 420,
  onPlay,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: 'relative',
      height,
      borderRadius: 'var(--efkt-radius-card)',
      overflow: 'hidden',
      background: 'var(--efkt-deep-navy)',
      ...style
    }
  }, rest), image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(12,14,57,0.65), rgba(12,14,57,0))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.PlayButton, {
    size: 64,
    onClick: onPlay
  })), quote ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 24,
      right: 24,
      bottom: 24
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--efkt-white)',
      fontSize: 'var(--text-h3)',
      fontWeight: 'var(--efkt-weight-regular)',
      lineHeight: 1.35,
      margin: 0
    }
  }, quote), name ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '12px',
      color: 'rgba(255,255,255,0.85)',
      fontSize: 'var(--efkt-text-body)'
    }
  }, name) : null) : null);
}
Object.assign(__ds_scope, { VideoThumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/media/VideoThumb.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavDropdown.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Header dropdown: one row per item (title + one Muted line + optional coral meta). */
function NavDropdown({
  label,
  items = [],
  open: openProp,
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(!!openProp);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(!!openProp),
    style: {
      position: 'relative',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("button", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--efkt-font)',
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-medium)',
      color: 'var(--efkt-navy)',
      padding: '12px 0'
    }
  }, label, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-down",
    style: {
      fontSize: '14px',
      color: 'var(--efkt-coral)'
    }
  })), open ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: '-24px',
      minWidth: '360px',
      background: 'var(--efkt-white)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--efkt-radius-card)',
      boxShadow: 'var(--efkt-shadow)',
      padding: 'var(--space-5)',
      display: 'grid',
      gap: '4px',
      zIndex: 20
    }
  }, items.map(it => /*#__PURE__*/React.createElement("a", {
    key: it.title,
    href: it.href || '#',
    style: {
      display: 'block',
      padding: '16px 20px',
      borderRadius: '12px',
      textDecoration: 'none',
      color: 'var(--efkt-navy)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--efkt-offwhite)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--efkt-text-body)',
      fontWeight: 'var(--efkt-weight-semibold)'
    }
  }, it.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: '4px',
      fontSize: 'var(--text-micro)',
      fontWeight: 'var(--efkt-weight-thin)',
      color: 'var(--text-muted)'
    }
  }, it.description), it.meta ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: '6px',
      fontSize: 'var(--text-micro)',
      color: 'var(--efkt-coral)'
    }
  }, it.meta) : null))) : null);
}
Object.assign(__ds_scope, { NavDropdown });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavDropdown.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Pill tab row. The active tab is coral; the rest are navy on off-white. */
function Tabs({
  items = [],
  value,
  onChange,
  style,
  ...rest
}) {
  const active = value != null ? value : items[0] && (items[0].value || items[0]);
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      flexWrap: 'wrap',
      ...style
    }
  }, rest), items.map(it => {
    const v = it.value || it;
    const label = it.label || it;
    const on = v === active;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(v),
      style: {
        padding: '14px 24px',
        minHeight: '50px',
        borderRadius: 'var(--efkt-radius-pill)',
        cursor: 'pointer',
        border: '1px solid ' + (on ? 'var(--efkt-coral)' : 'var(--border-default)'),
        background: on ? 'var(--efkt-coral)' : 'var(--efkt-offwhite)',
        color: on ? 'var(--efkt-white)' : 'var(--efkt-navy)',
        fontFamily: 'var(--efkt-font)',
        fontSize: 'var(--efkt-text-body)',
        fontWeight: on ? 'var(--efkt-weight-bold)' : 'var(--efkt-weight-medium)',
        transition: 'background var(--efkt-duration) var(--efkt-ease)'
      }
    }, label);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// slides/Slides.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* EFKT slide library. Designed at 1280x720 = 960x540pt, so 1pt = 1.3333px.
   Every size below is the guideline pt value x 1.3333 — nothing is scaled down. */
const PT = 1.3333;
const pt = n => Math.round(n * PT) + 'px';
const {
  Button,
  SectionHeading,
  Logo,
  Tag,
  Card,
  StatCard,
  ImageCard,
  ServiceCard,
  QuoteBlock,
  DashedSection,
  BarChart,
  Icon,
  CircleAction
} = window.EFKTDesignSystem_b30f3d;
const IMG = {
  hero: 'https://framerusercontent.com/images/J2vQNnIH0twAtGj5w005CYKG0CM.png?width=1440',
  a: 'https://framerusercontent.com/images/wtFIpUccGh4qSGctjLvQA5PnOI.jpg?width=1200',
  b: 'https://framerusercontent.com/images/z8GM9HnAdDetZe2h9JLorvCdOns.jpg?width=1200',
  c: 'https://framerusercontent.com/images/OAVTjNxr2OvU80B80ZejzgMYS8.jpg?width=1200'
};
const M = {
  paddingLeft: pt(48),
  paddingRight: pt(48),
  paddingTop: pt(40),
  paddingBottom: pt(44)
};
function Stage({
  children,
  background = 'var(--efkt-white)',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '1280px',
      height: '720px',
      background,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--efkt-font)',
      color: 'var(--efkt-navy)',
      ...style
    }
  }, children);
}
function TwoWeight({
  thin,
  fat,
  thinAfter,
  size,
  fatWeight = 800,
  align = 'left',
  tone = 'navy'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: size,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      fontWeight: 300,
      textAlign: align,
      color: tone === 'onDark' ? 'var(--efkt-white)' : 'var(--efkt-navy)',
      textWrap: 'pretty'
    }
  }, thin ? thin + ' ' : '', /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: fatWeight
    }
  }, fat), thinAfter ? ' ' + thinAfter : '');
}
function PageMark({
  n,
  tone = 'navy'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: pt(48),
      bottom: pt(32),
      display: 'flex',
      alignItems: 'center',
      gap: pt(16)
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: pt(14),
      fontWeight: 400,
      color: tone === 'onDark' ? 'rgba(255,255,255,0.7)' : 'var(--efkt-muted)'
    }
  }, n), /*#__PURE__*/React.createElement(Logo, {
    variant: tone === 'onDark' ? 'white' : 'primary',
    width: 110,
    base: "../assets/logo/"
  }));
}

/* 1 — Cover: full-bleed photo, two-weight display min 54pt, lead, coral CTA, logo */
function CoverSlide() {
  return /*#__PURE__*/React.createElement(Stage, null, /*#__PURE__*/React.createElement("img", {
    src: IMG.hero,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(12,14,57,0.72), rgba(12,14,57,0.05) 70%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      ...M,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(TwoWeight, {
    fat: "Marketing solutions",
    thinAfter: "for real estate agents",
    size: pt(54),
    tone: "onDark"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: pt(20),
      fontSize: pt(20),
      fontWeight: 300,
      lineHeight: 1.5,
      color: 'rgba(255,255,255,0.92)',
      maxWidth: '640px'
    }
  }, "The complete solution from \u201CFor Sale\u201D to \u201CSold\u201D. #WeCreateEFKT."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: pt(28),
      marginTop: pt(32)
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary"
  }, "Book a walkthrough"), /*#__PURE__*/React.createElement(Logo, {
    variant: "white",
    width: 150,
    base: "../assets/logo/"
  }))));
}

/* 2 — Agenda: white, numbered list min 20pt, coral numbers */
function AgendaSlide() {
  const items = ['Where the market is today', 'Content that sells homes', 'Activation and advertising', 'Documented results', 'What we suggest for you'];
  return /*#__PURE__*/React.createElement(Stage, null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...M,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(TwoWeight, {
    thin: "Today\u2019s",
    fat: "agenda",
    size: pt(36)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: pt(40),
      display: 'grid',
      gap: pt(20)
    }
  }, items.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: pt(24)
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: pt(28),
      fontWeight: 800,
      color: 'var(--efkt-coral)',
      minWidth: pt(48)
    }
  }, '0' + (i + 1)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: pt(20),
      fontWeight: 300
    }
  }, t))))), /*#__PURE__*/React.createElement(PageMark, {
    n: "02"
  }));
}

/* 3 — Section divider: whole pastel surface, centred two-weight H1 in navy */
function SectionSlide() {
  return /*#__PURE__*/React.createElement(Stage, {
    background: "var(--efkt-sand)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...M,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: pt(14),
      fontWeight: 500,
      color: 'var(--efkt-muted)',
      marginBottom: pt(20)
    }
  }, "Part two"), /*#__PURE__*/React.createElement(TwoWeight, {
    thin: "Production",
    fat: "of content",
    size: pt(36),
    align: "center"
  })), /*#__PURE__*/React.createElement(PageMark, {
    n: "03"
  }));
}

/* 4 — Content, one column: H1 + lead + max 5 points */
function ContentSlide() {
  const points = ['Photo, floor plans and video from one order', 'Next-day delivery on the daily products', 'One contact person for the whole agency', 'Advertising built on the same content'];
  return /*#__PURE__*/React.createElement(Stage, null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...M,
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement(TwoWeight, {
    thin: "Everything from",
    fat: "one order",
    size: pt(36)
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: pt(20),
      fontSize: pt(16),
      fontWeight: 300,
      lineHeight: 1.5,
      color: 'var(--efkt-navy)',
      maxWidth: '760px'
    }
  }, "You order once. We produce, deliver and activate the content \u2014 and you keep one contact person for all of it."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: pt(32),
      display: 'grid',
      gap: pt(16),
      maxWidth: '820px'
    }
  }, points.map(p => /*#__PURE__*/React.createElement("div", {
    key: p,
    style: {
      display: 'flex',
      gap: pt(16),
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 32,
    tone: "primary"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: pt(16),
      fontWeight: 300
    }
  }, p))))), /*#__PURE__*/React.createElement(PageMark, {
    n: "04"
  }));
}

/* 5 — Split 50/50: text left, image right, radius 20 */
function SplitSlide() {
  return /*#__PURE__*/React.createElement(Stage, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      height: '100%',
      alignItems: 'center',
      ...M,
      gap: pt(48)
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TwoWeight, {
    thin: "Content that",
    fat: "sells homes",
    size: pt(36)
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: pt(20),
      fontSize: pt(16),
      fontWeight: 300,
      lineHeight: 1.5
    }
  }, "Daylight photography, floor plans buyers understand and video cut for the platforms your buyers already use."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: pt(28)
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    iconRight: "arrow-right"
  }, "See the products"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '480px',
      borderRadius: '20px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: IMG.a,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '20px',
      right: '20px'
    }
  }, /*#__PURE__*/React.createElement(CircleAction, {
    tone: "onPhoto"
  })))), /*#__PURE__*/React.createElement(PageMark, {
    n: "05"
  }));
}

/* 6 — Three cards */
function ThreeCardSlide() {
  const items = [{
    icon: 'camera',
    title: 'Photo',
    body: 'Daylight interiors, edited to EFKT standards.'
  }, {
    icon: 'blueprint',
    title: 'Floor plans',
    body: 'Buyers place their furniture before the viewing.'
  }, {
    icon: 'video-camera',
    title: 'Video',
    body: 'Vertical and 16:9 cuts from the same shoot.'
  }];
  return /*#__PURE__*/React.createElement(Stage, null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...M,
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement(TwoWeight, {
    thin: "Three products, one",
    fat: "delivery",
    size: pt(36)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: pt(24),
      marginTop: pt(40)
    }
  }, items.map(i => /*#__PURE__*/React.createElement(ServiceCard, _extends({
    key: i.title
  }, i, {
    surface: "offwhite",
    style: {
      padding: pt(28)
    }
  }))))), /*#__PURE__*/React.createElement(PageMark, {
    n: "06"
  }));
}

/* 7 — Bento mosaic */
function BentoSlide() {
  return /*#__PURE__*/React.createElement(Stage, null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...M,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(TwoWeight, {
    thin: "The whole",
    fat: "story",
    size: pt(36)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: '1.6fr 1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: '20px',
      marginTop: pt(24)
    }
  }, /*#__PURE__*/React.createElement(ImageCard, {
    image: IMG.a,
    title: "Photography",
    body: "Every room, in daylight.",
    height: "100%",
    style: {
      gridRow: 'span 2'
    }
  }), /*#__PURE__*/React.createElement(ImageCard, {
    image: IMG.b,
    title: "Floor plans",
    height: "100%"
  }), /*#__PURE__*/React.createElement(ImageCard, {
    image: IMG.c,
    title: "Video",
    height: "100%"
  }), /*#__PURE__*/React.createElement(ImageCard, {
    image: IMG.hero,
    title: "Advertising",
    height: "100%",
    style: {
      gridColumn: 'span 2'
    }
  }))), /*#__PURE__*/React.createElement(PageMark, {
    n: "07"
  }));
}

/* 8 — KPI slide */
function KpiSlide() {
  return /*#__PURE__*/React.createElement(Stage, {
    background: "var(--efkt-mint)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...M,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(TwoWeight, {
    thin: "What our customers",
    fat: "measure",
    size: pt(36)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: pt(48),
      marginTop: pt(48)
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    value: "28",
    unit: "%",
    label: "shorter time on market than the rest of the market (EFKT customer data, 2024)",
    tone: "coral",
    size: 80
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: "20",
    unit: "+",
    label: "years of content production",
    size: 80
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: "46",
    unit: " days",
    label: "average time on market for EFKT advertising customers",
    size: 80
  }))), /*#__PURE__*/React.createElement(PageMark, {
    n: "08"
  }));
}

/* 9 — Quote slide: dark photo with scrim */
function QuoteSlide() {
  return /*#__PURE__*/React.createElement(Stage, null, /*#__PURE__*/React.createElement("img", {
    src: IMG.c,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to right, rgba(12,14,57,0.8), rgba(12,14,57,0.15))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      ...M,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: pt(32),
      fontWeight: 400,
      lineHeight: 1.2,
      color: 'var(--efkt-white)',
      maxWidth: '720px',
      margin: 0
    }
  }, "\u201CEFKT, as a partner, delivers solid quality in the work they do\u201D"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: pt(24),
      fontSize: pt(16),
      fontWeight: 500,
      color: 'rgba(255,255,255,0.9)'
    }
  }, "Daniel Lanto, Eie Eiendomsmegling")), /*#__PURE__*/React.createElement(PageMark, {
    n: "09",
    tone: "onDark"
  }));
}

/* 10 — Chart slide */
function ChartSlide() {
  return /*#__PURE__*/React.createElement(Stage, null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...M,
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement(TwoWeight, {
    thin: "Days on",
    fat: "market",
    size: pt(36)
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: pt(16),
      fontSize: pt(14),
      fontWeight: 400,
      color: 'var(--efkt-muted)'
    }
  }, "Source: EFKT customer data, January\u2013December 2024. Market average from national listing statistics."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: pt(32),
      maxWidth: '760px'
    }
  }, /*#__PURE__*/React.createElement(BarChart, {
    height: 320,
    unit: " days",
    data: [{
      label: 'Market average',
      value: 64
    }, {
      label: 'EFKT customers',
      value: 46,
      accent: true
    }]
  }))), /*#__PURE__*/React.createElement(PageMark, {
    n: "10"
  }));
}

/* 11 — Closing */
function ClosingSlide() {
  return /*#__PURE__*/React.createElement(Stage, {
    background: "var(--efkt-deep-navy)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...M,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: pt(28)
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "white",
    width: 280,
    base: "../assets/logo/"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: pt(20),
      fontWeight: 300,
      color: 'rgba(255,255,255,0.9)'
    }
  }, "#WeCreateEFKT"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: pt(40),
      fontSize: pt(16),
      fontWeight: 300,
      color: 'rgba(255,255,255,0.8)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "hello@efkt.com"), /*#__PURE__*/React.createElement("span", null, "+45 70 60 40 20"), /*#__PURE__*/React.createElement("span", null, "efkt.com"))));
}
Object.assign(window, {
  CoverSlide,
  AgendaSlide,
  SectionSlide,
  ContentSlide,
  SplitSlide,
  ThreeCardSlide,
  BentoSlide,
  KpiSlide,
  QuoteSlide,
  ChartSlide,
  ClosingSlide,
  EFKTSlideStage: Stage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/Slides.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Chrome.jsx
try { (() => {
const {
  Button,
  Logo,
  Tag
} = window.EFKTDesignSystem_b30f3d;
const {
  NavDropdown
} = window.EFKTDesignSystem_b30f3d;
const NAV = {
  solutions: [{
    title: 'Content Creation',
    description: 'Visuals that stand out',
    meta: 'Photo • Floor plans • Video • Visualization'
  }, {
    title: 'Content Activation',
    description: 'Strategies that perform',
    meta: 'SoMe • Advertising'
  }],
  resources: [{
    title: 'Webinars',
    description: 'Words from experts'
  }, {
    title: 'Whitepapers & Reports',
    description: 'Data-driven insights'
  }, {
    title: 'Blog',
    description: 'Stay inspired with insights'
  }, {
    title: 'Events',
    description: 'Join us in person'
  }],
  company: [{
    title: 'Our Story',
    description: 'From the beginning'
  }, {
    title: 'Career',
    description: 'Future at EFKT'
  }, {
    title: 'Press & Media',
    description: 'Latest news'
  }]
};
function Header({
  page,
  onNavigate
}) {
  const link = (label, target) => /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate(target),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--efkt-font)',
      fontSize: '16px',
      fontWeight: 'var(--efkt-weight-medium)',
      color: page === target ? 'var(--efkt-coral)' : 'var(--efkt-navy)',
      padding: '12px 0'
    }
  }, label);
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 30,
      height: '72px',
      background: 'var(--efkt-white)',
      borderBottom: '1px solid var(--border-default)',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '40px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate('home'),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "primary",
    width: 110,
    base: "../../assets/logo/"
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '28px',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(NavDropdown, {
    label: "Solutions",
    items: NAV.solutions
  }), link('Why choose EFKT', 'why'), link('Resources', 'resources'), /*#__PURE__*/React.createElement(NavDropdown, {
    label: "Company",
    items: NAV.company
  }), link('Contact & Support', 'contact')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--efkt-font)',
      fontSize: '16px',
      fontWeight: 'var(--efkt-weight-medium)',
      color: 'var(--efkt-coral)'
    }
  }, "Log in"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => onNavigate('contact'),
    style: {
      minHeight: '50px'
    }
  }, "Try us out"))));
}
function Footer({
  onNavigate
}) {
  const col = (title, items) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: 'var(--efkt-weight-semibold)',
      color: 'var(--efkt-navy)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '12px',
      marginTop: '20px'
    }
  }, items.map(i => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: "#",
    style: {
      fontSize: '16px',
      fontWeight: 'var(--efkt-weight-thin)',
      color: 'var(--text-muted)'
    }
  }, i))));
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--surface-section)',
      borderTop: '1px solid var(--border-default)',
      padding: '96px 24px 40px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr 1fr 1.4fr',
      gap: '48px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Logo, {
    variant: "primary",
    width: 120,
    base: "../../assets/logo/"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '24px',
      fontSize: '16px',
      fontWeight: 'var(--efkt-weight-thin)',
      lineHeight: 1.6,
      color: 'var(--text-muted)',
      maxWidth: '300px'
    }
  }, "We help real estate agents succeed with tailored solutions \u2014 whether for small local offices or large chains."), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: 'inline-block',
      marginTop: '20px',
      fontSize: '16px'
    }
  }, "A part of Esoft Group"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '16px',
      marginTop: '24px'
    }
  }, ['instagram-logo', 'facebook-logo', 'linkedin-logo'].map(i => /*#__PURE__*/React.createElement("i", {
    key: i,
    className: 'ph ph-' + i,
    style: {
      fontSize: '24px',
      color: 'var(--efkt-navy)'
    }
  })))), col('Solutions', ['Content Creation', 'Content Activation', 'Why Choose EFKT', 'Resources']), col('Company', ['About EFKT', 'Career', 'Press & Media', 'Support', 'Security & Compliance']), /*#__PURE__*/React.createElement(Newsletter, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '1200px',
      margin: '64px auto 0',
      paddingTop: '24px',
      borderTop: '1px solid var(--border-default)',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '14px',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2024 EFKT. All rights reserved"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: '24px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Whistleblower"), /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Privacy policy"))));
}
function Newsletter() {
  const {
    Input,
    Checkbox,
    Button,
    Toast
  } = window.EFKTDesignSystem_b30f3d;
  const [ok, setOk] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: 'var(--efkt-weight-semibold)',
      color: 'var(--efkt-navy)'
    }
  }, "Get our news"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '12px',
      fontSize: '16px',
      fontWeight: 'var(--efkt-weight-thin)',
      color: 'var(--text-muted)',
      lineHeight: 1.6
    }
  }, "Regardless of the location and size of your store, we can help you."), sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '20px'
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: "success",
    title: "Thanks \u2014 you're on the list",
    body: "Confirm the subscription from your inbox."
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '16px',
      marginTop: '20px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    icon: "envelope",
    placeholder: "name@agency.dk",
    "aria-label": "E-mail"
  }), /*#__PURE__*/React.createElement(Checkbox, {
    checked: ok,
    onChange: e => setOk(e.target.checked),
    label: "I consent to receiving marketing e-mails from EFKT."
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    disabled: !ok,
    onClick: () => setSent(true)
  }, "Sign up")));
}
Object.assign(window, {
  Header,
  Footer,
  Newsletter,
  EFKT_NAV: NAV
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ContactForm.jsx
try { (() => {
const {
  SectionHeading,
  Card,
  Input,
  Select,
  Checkbox,
  Radio,
  Button,
  Toast,
  Dialog,
  Icon
} = window.EFKTDesignSystem_b30f3d;
function ContactForm() {
  const WRAP = window.EFKT_WRAP;
  const [size, setSize] = React.useState('local');
  const [consent, setConsent] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [help, setHelp] = React.useState(false);
  const invalid = email.length > 0 && !email.includes('@');
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '96px 24px 120px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...WRAP,
      display: 'grid',
      gridTemplateColumns: '1fr 1.1fr',
      gap: '64px',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    level: "h1",
    thin: "Let us",
    fat: "talk"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '24px',
      fontSize: '18px',
      fontWeight: 300,
      lineHeight: 1.6,
      color: 'var(--text-muted)',
      maxWidth: '440px'
    }
  }, "Tell us about your agency and what you need. We call you back within one working day."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '20px',
      marginTop: '40px'
    }
  }, [['phone', '+45 70 60 40 20'], ['envelope', 'hello@efkt.com'], ['map-pin', 'Odense · Copenhagen · Oslo']].map(([i, t]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: i,
    size: 24,
    tone: "primary"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '16px',
      fontWeight: 300
    }
  }, t)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '32px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "tertiary",
    onClick: () => setHelp(true)
  }, "What happens after I send this?"))), /*#__PURE__*/React.createElement(Card, {
    padding: 32
  }, sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '24px'
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: "success",
    title: "Thanks \u2014 we have your request",
    body: "One of our specialists calls you back within one working day."
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setSent(false)
  }, "Send another request")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Name",
    placeholder: "Your name"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Agency",
    placeholder: "Agency name"
  })), /*#__PURE__*/React.createElement(Input, {
    label: "E-mail",
    icon: "envelope",
    placeholder: "name@agency.dk",
    value: email,
    onChange: e => setEmail(e.target.value),
    error: invalid ? 'That e-mail looks wrong.' : undefined
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Language",
    options: ['English', 'Danish', 'Norwegian']
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: 500,
      marginBottom: '12px'
    }
  }, "Type of agency"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '24px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Radio, {
    name: "size",
    checked: size === 'local',
    onChange: () => setSize('local'),
    label: "Local office"
  }), /*#__PURE__*/React.createElement(Radio, {
    name: "size",
    checked: size === 'chain',
    onChange: () => setSize('chain'),
    label: "City chain"
  }), /*#__PURE__*/React.createElement(Radio, {
    name: "size",
    checked: size === 'special',
    onChange: () => setSize('special'),
    label: "Specialised"
  }))), /*#__PURE__*/React.createElement(Input, {
    label: "What do you need help with?",
    multiline: true,
    placeholder: "Photo, video, advertising\u2026"
  }), /*#__PURE__*/React.createElement(Checkbox, {
    checked: consent,
    onChange: e => setConsent(e.target.checked),
    label: "I consent to EFKT contacting me and processing my data as described in the privacy policy."
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    disabled: !consent || invalid,
    onClick: () => setSent(true)
  }, "Send request")))), /*#__PURE__*/React.createElement(Dialog, {
    open: help,
    title: "What happens next",
    onClose: () => setHelp(false),
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: () => setHelp(false)
    }, "Got it")
  }, "A specialist reviews your request, calls you within one working day, and puts together a package of content and activation that fits the size of your agency."));
}
Object.assign(window, {
  ContactForm
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ContactForm.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ContentCreation.jsx
try { (() => {
const {
  Button,
  SectionHeading,
  Card,
  ImageCard,
  ServiceCard,
  Tabs,
  StatCard,
  BarChart,
  DataTable,
  PlayButton
} = window.EFKTDesignSystem_b30f3d;
const CC_IMG = window.EFKT_IMG;
const CC_WRAP = window.EFKT_WRAP;
function ContentCreation({
  onNavigate
}) {
  const [tab, setTab] = React.useState('Photo');
  const products = {
    Photo: {
      body: 'Daylight interiors shot and edited to EFKT standards, delivered next day.',
      image: CC_IMG.a,
      points: ['Next-day delivery', 'Retouch included', 'Ready for every portal']
    },
    'Floor plans': {
      body: '2D and 3D plans that help buyers place their furniture before the viewing.',
      image: CC_IMG.b,
      points: ['2D and 3D', 'Room-by-room measurements', 'Portal-ready formats']
    },
    Video: {
      body: 'Property films and vertical cuts, produced for social platforms as well as portals.',
      image: CC_IMG.c,
      points: ['16:9 and 9:16 cuts', 'Drone add-on', '48-hour delivery']
    }
  };
  const p = products[tab];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '96px 24px 64px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: CC_WRAP
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: 500,
      color: 'var(--text-muted)',
      marginBottom: '12px'
    }
  }, "Get your creations"), /*#__PURE__*/React.createElement(SectionHeading, {
    level: "hero",
    thin: "Production",
    fat: "of content"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '24px',
      maxWidth: '760px',
      fontSize: '18px',
      fontWeight: 300,
      lineHeight: 1.6,
      color: 'var(--text-muted)'
    }
  }, "More than 20 years of content production. Our specialists create everything from visually appealing photos and videos to cutting edge floor plans and 3D visualizations."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '16px',
      marginTop: '32px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => onNavigate('contact')
  }, "Try us out"), /*#__PURE__*/React.createElement(Button, {
    variant: "tertiary",
    iconRight: "arrow-right",
    onClick: () => onNavigate('home')
  }, "Back to overview")))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '0 24px 96px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: CC_WRAP
  }, /*#__PURE__*/React.createElement(Tabs, {
    items: Object.keys(products),
    value: tab,
    onChange: setTab
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '32px',
      marginTop: '32px',
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      borderRadius: '20px',
      overflow: 'hidden',
      minHeight: '420px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: p.image,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(12,14,57,0.5), rgba(12,14,57,0))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: '24px',
      left: '24px'
    }
  }, /*#__PURE__*/React.createElement(PlayButton, {
    size: 56
  }))), /*#__PURE__*/React.createElement(Card, {
    padding: 32,
    surface: "offwhite",
    shadow: false
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: '32px',
      fontWeight: 300,
      letterSpacing: '-0.03em',
      lineHeight: 1.25
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800
    }
  }, tab), " for every listing"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '20px',
      fontSize: '16px',
      fontWeight: 300,
      lineHeight: 1.6,
      color: 'var(--text-muted)'
    }
  }, p.body), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '16px',
      marginTop: '32px'
    }
  }, p.points.map(pt => /*#__PURE__*/React.createElement("div", {
    key: pt,
    style: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-check-circle",
    style: {
      fontSize: '24px',
      color: 'var(--efkt-coral)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '16px',
      fontWeight: 300
    }
  }, pt)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '32px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => onNavigate('contact')
  }, "Request a quote")))))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-section)',
      padding: '96px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...CC_WRAP,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '64px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    level: "h2",
    thin: "Documented",
    fat: "results"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '20px',
      fontSize: '16px',
      fontWeight: 300,
      lineHeight: 1.6,
      color: 'var(--text-muted)'
    }
  }, "Average days on market, EFKT advertising customers versus the rest of the market. Source: EFKT customer data, 2024."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '48px',
      marginTop: '32px'
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    value: "28",
    unit: "%",
    label: "shorter time on market",
    tone: "coral"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: "20",
    unit: "+",
    label: "years of production"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--efkt-white)',
      borderRadius: '20px',
      border: '1px solid var(--border-default)',
      padding: '32px'
    }
  }, /*#__PURE__*/React.createElement(BarChart, {
    height: 240,
    unit: " days",
    data: [{
      label: 'Market average',
      value: 64
    }, {
      label: 'EFKT customers',
      value: 46,
      accent: true
    }]
  })))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '96px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: CC_WRAP
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    level: "h2",
    thin: "What is",
    fat: "included"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '32px',
      background: 'var(--efkt-white)',
      border: '1px solid var(--border-default)',
      borderRadius: '20px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: ['Product', 'Delivery', 'Included in Total EFKT'],
    rows: [['Photo', 'Next day', 'Yes'], ['Floor plan', 'Next day', 'Yes'], ['Video', '48 hours', 'Add-on'], ['3D visualization', '3–5 days', 'Add-on'], ['Copywriting', 'Next day', 'Yes']]
  })))));
}
Object.assign(window, {
  ContentCreation
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ContentCreation.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Home.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  Button,
  SectionHeading,
  Tag,
  Card,
  ImageCard,
  ServiceCard,
  StatCard,
  QuoteBlock,
  DashedSection,
  VideoThumb,
  Icon
} = window.EFKTDesignSystem_b30f3d;
const IMG = {
  hero: 'https://framerusercontent.com/images/J2vQNnIH0twAtGj5w005CYKG0CM.png?width=1440',
  a: 'https://framerusercontent.com/images/wtFIpUccGh4qSGctjLvQA5PnOI.jpg?width=1200',
  b: 'https://framerusercontent.com/images/z8GM9HnAdDetZe2h9JLorvCdOns.jpg?width=1200',
  c: 'https://framerusercontent.com/images/OAVTjNxr2OvU80B80ZejzgMYS8.jpg?width=1200'
};
const WRAP = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px'
};
function Hero({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      minHeight: '640px',
      display: 'flex',
      alignItems: 'flex-end',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: IMG.hero,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(12,14,57,0.65), rgba(12,14,57,0.1) 70%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...WRAP,
      position: 'relative',
      paddingBottom: '96px',
      paddingTop: '160px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: '70px',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      fontWeight: 300,
      color: 'var(--efkt-white)',
      margin: 0,
      maxWidth: '900px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800
    }
  }, "Marketing solutions"), " for real estate agents"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '24px',
      fontSize: '18px',
      fontWeight: 300,
      lineHeight: 1.6,
      color: 'rgba(255,255,255,0.92)',
      maxWidth: '620px'
    }
  }, "The complete solution from \u201CFor Sale\u201D to \u201CSold\u201D. #WeCreateEFKT."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '16px',
      marginTop: '32px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => onNavigate('contact')
  }, "Try us out"), /*#__PURE__*/React.createElement(Button, {
    variant: "onPhoto",
    onClick: () => onNavigate('creation')
  }, "See our content")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      marginTop: '48px',
      flexWrap: 'wrap'
    }
  }, ['Social media', 'Video', 'Drone', 'Photography', 'Advertising', '360°'].map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    tone: "onPhoto"
  }, t)))));
}
function DidYouKnow({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--efkt-mint)',
      padding: '96px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1.4fr',
      gap: '64px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    value: "28",
    unit: "%",
    label: "reduced time on market for customers using our digital advertising, compared with the rest of the market (2024)",
    tone: "coral",
    size: 96
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '20px',
      fontWeight: 300,
      lineHeight: 1.5,
      color: 'var(--efkt-navy)'
    }
  }, "Did you know that we specialise in digital advertising \u2014 and that our customers who use these products experience 28% reduced time on market in comparison to the rest of the market?"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '24px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    iconRight: "arrow-right",
    onClick: () => onNavigate('why')
  }, "Learn how they achieve this")))));
}
function AllInOne() {
  const items = [{
    image: IMG.a,
    title: 'Get invited to more property valuations',
    body: 'Be top of mind in the exact moment the decision to sell is made.'
  }, {
    image: IMG.b,
    title: 'Win more property valuations',
    body: 'All the tools to give your customers the best conditions.'
  }, {
    image: IMG.c,
    title: 'Sell properties faster',
    body: 'Update content regularly and activate it towards potential buyers.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '120px 24px',
      background: 'var(--efkt-white)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: WRAP
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    level: "h1",
    thin: "All in",
    fat: "one"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '24px',
      maxWidth: '760px',
      fontSize: '18px',
      fontWeight: 300,
      lineHeight: 1.6,
      color: 'var(--text-muted)'
    }
  }, "At EFKT we give you a 360 degrees solution delivering world class content and boosting it with our advertising \u2014 so your listings become compelling stories that resonate with your audience."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.3fr 1fr 1fr',
      gap: '24px',
      marginTop: '48px'
    }
  }, items.map(i => /*#__PURE__*/React.createElement(ImageCard, _extends({
    key: i.title
  }, i, {
    height: 420
  }))))));
}
function Creation({
  onNavigate
}) {
  const items = [{
    icon: 'camera',
    title: 'Photo',
    body: 'Capturing each property with stunning accuracy and aesthetics.'
  }, {
    icon: 'blueprint',
    title: 'Floor plans',
    body: 'Helping buyers envision furniture placement and sense the space.'
  }, {
    icon: 'cube',
    title: 'Visualizations',
    body: '3D visualizations help buyers bridge the imagination gap.'
  }, {
    icon: 'pen-nib',
    title: 'Copywriting',
    body: 'Crafting text that highlights each home’s unique story and appeal.'
  }, {
    icon: 'video-camera',
    title: 'Video',
    body: 'Video stands out as the most effective tool for online visibility.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '0 24px 120px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: WRAP
  }, /*#__PURE__*/React.createElement(DashedSection, {
    label: "Get your creations"
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    level: "h2",
    thin: "Content",
    fat: "creation",
    align: "center"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '20px auto 0',
      maxWidth: '720px',
      textAlign: 'center',
      fontSize: '16px',
      fontWeight: 300,
      lineHeight: 1.6,
      color: 'var(--text-muted)'
    }
  }, "With more than 20 years experience in content creation we take pride in delivering quality over quantity at all times."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5,1fr)',
      gap: '20px',
      marginTop: '40px'
    }
  }, items.map(i => /*#__PURE__*/React.createElement(ServiceCard, _extends({
    key: i.title
  }, i, {
    surface: "white"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '32px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    iconRight: "arrow-right",
    onClick: () => onNavigate('creation')
  }, "More about content")))));
}
function Activation() {
  const items = [{
    icon: 'instagram-logo',
    title: 'Organic social media',
    body: 'Engaging content that boosts property sales and builds brand presence organically.'
  }, {
    icon: 'megaphone',
    title: 'Property ads',
    body: 'Showcasing properties to attract the right buyers effectively.'
  }, {
    icon: 'chart-line-up',
    title: 'Realtor ads',
    body: 'Highlighting your business to boost brand visibility and generate leads.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-section)',
      padding: '120px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: WRAP
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: 500,
      color: 'var(--text-muted)',
      marginBottom: '12px'
    }
  }, "Activate your creations"), /*#__PURE__*/React.createElement(SectionHeading, {
    level: "h1",
    thin: "Content",
    fat: "activation"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '24px',
      maxWidth: '760px',
      fontSize: '18px',
      fontWeight: 300,
      lineHeight: 1.6,
      color: 'var(--text-muted)'
    }
  }, "Well-produced content deserves effective activation. Our media department keeps your digital presence impactful and up to date."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: '24px',
      marginTop: '48px'
    }
  }, items.map(i => /*#__PURE__*/React.createElement(ServiceCard, _extends({
    key: i.title
  }, i, {
    surface: "white"
  }))))));
}
function TotalEfkt({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--efkt-deep-navy)',
      padding: '120px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...WRAP,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    level: "h1",
    thin: "Total",
    fat: "EFKT",
    align: "center",
    tone: "onDark"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '24px auto 0',
      maxWidth: '720px',
      fontSize: '18px',
      fontWeight: 300,
      lineHeight: 1.6,
      color: 'rgba(255,255,255,0.85)'
    }
  }, "Great content is just the beginning. Paired with the right activation it creates real impact \u2014 powerful content and strategic activation, so you stand out with measurable results."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '32px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => onNavigate('contact')
  }, "Try us out"))));
}
function Testimonials() {
  const items = [{
    image: IMG.b,
    quote: '“We have a contact person who manages our social media to perfection”',
    name: 'Alexander L. Smedegaard, LokalBolig'
  }, {
    image: IMG.c,
    quote: '“EFKT, as a partner, delivers solid quality in the work they do”',
    name: 'Daniel Lanto, Eie Eiendomsmegling'
  }, {
    image: IMG.a,
    quote: '“We can trust that our order will be delivered — always”',
    name: 'Frederikke B. Larsen, Realmæglerne Hallberg'
  }];
  const logos = ['6tTbkXggWgQCAJ4DO2QEdXXmgM', '11KSGbIZoRSg4pjdnUoif6MKHI', 'SYAMdyIdBO2R7G5oTXR0aQnYAg', 'JoDq5ifknCO39hBtuei8g7uVrKI', '0bixthqtfG9RXlJfvIL1iHnlf0', 'QLhH4kvqEbU8qrrmRhIKgSE2SJQ'];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '120px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: WRAP
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    level: "h1",
    thin: "What do our",
    fat: "customers say?"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '24px',
      maxWidth: '700px',
      fontSize: '18px',
      fontWeight: 300,
      lineHeight: 1.6,
      color: 'var(--text-muted)'
    }
  }, "Below you will find three video presentations of customers who have each experienced EFKT in full force."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: '24px',
      marginTop: '48px'
    }
  }, items.map(i => /*#__PURE__*/React.createElement(VideoThumb, _extends({
    key: i.name
  }, i, {
    height: 420
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '32px',
      marginTop: '96px',
      padding: '48px',
      background: 'var(--efkt-sand)',
      borderRadius: '20px'
    }
  }, logos.map(id => /*#__PURE__*/React.createElement("img", {
    key: id,
    src: 'https://framerusercontent.com/images/' + id + '.svg',
    alt: "",
    style: {
      height: '32px',
      filter: 'grayscale(1) brightness(0.45)',
      opacity: 0.8
    }
  })))));
}
function Home({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Hero, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(DidYouKnow, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(AllInOne, null), /*#__PURE__*/React.createElement(Creation, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(Activation, null), /*#__PURE__*/React.createElement(TotalEfkt, {
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement(Testimonials, null));
}
Object.assign(window, {
  Home,
  Hero,
  DidYouKnow,
  AllInOne,
  Creation,
  Activation,
  TotalEfkt,
  Testimonials,
  EFKT_IMG: IMG,
  EFKT_WRAP: WRAP
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Resources.jsx
try { (() => {
const {
  SectionHeading,
  Card,
  Tabs,
  Badge,
  Button,
  ImageCard,
  CircleAction
} = window.EFKTDesignSystem_b30f3d;
function Resources({
  onNavigate
}) {
  const [tab, setTab] = React.useState('Blog');
  const IMG = window.EFKT_IMG,
    WRAP = window.EFKT_WRAP;
  const items = {
    Webinars: [{
      badge: 'Webinar',
      title: 'Advertising that shortens time on market',
      meta: '45 min · Danish'
    }, {
      badge: 'Webinar',
      title: 'Building a social presence as a local agent',
      meta: '30 min · Norwegian'
    }, {
      badge: 'Webinar',
      title: 'From listing to campaign in one day',
      meta: '40 min · English'
    }],
    'Whitepapers & Reports': [{
      badge: 'Report',
      title: 'Days on market 2024 — the Nordic picture',
      meta: '24 pages · PDF'
    }, {
      badge: 'Whitepaper',
      title: 'What buyers look at first',
      meta: '16 pages · PDF'
    }, {
      badge: 'Report',
      title: 'Content that converts viewings',
      meta: '18 pages · PDF'
    }],
    Blog: [{
      badge: 'Blog',
      title: 'Five things buyers notice in the first photo',
      meta: '4 min read'
    }, {
      badge: 'Blog',
      title: 'Why floor plans still close viewings',
      meta: '3 min read'
    }, {
      badge: 'Blog',
      title: 'Vertical video for property listings',
      meta: '5 min read'
    }],
    Events: [{
      badge: 'Event',
      title: 'EFKT Live, Copenhagen',
      meta: '12 September · Copenhagen'
    }, {
      badge: 'Event',
      title: 'Agent breakfast, Oslo',
      meta: '3 October · Oslo'
    }, {
      badge: 'Event',
      title: 'Property marketing day, Aarhus',
      meta: '28 October · Aarhus'
    }]
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '96px 24px 48px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: WRAP
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    level: "hero",
    thin: "Stay",
    fat: "inspired"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '24px',
      maxWidth: '700px',
      fontSize: '18px',
      fontWeight: 300,
      lineHeight: 1.6,
      color: 'var(--text-muted)'
    }
  }, "Words from experts, data-driven insights and the places you can meet us in person."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '40px'
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    items: Object.keys(items),
    value: tab,
    onChange: setTab
  })))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '0 24px 96px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...WRAP,
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: '24px'
    }
  }, items[tab].map(it => /*#__PURE__*/React.createElement(Card, {
    key: it.title,
    padding: 28
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: tab === 'Events' ? 'sand' : 'mint'
  }, it.badge), /*#__PURE__*/React.createElement(CircleAction, {
    tone: "navy"
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      marginTop: '24px',
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.3
    }
  }, it.title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '12px',
      fontSize: '14px',
      color: 'var(--text-muted)'
    }
  }, it.meta))))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '0 24px 120px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: WRAP
  }, /*#__PURE__*/React.createElement(ImageCard, {
    image: IMG.a,
    height: 380,
    title: "Taste the EFKT",
    tag: "Case",
    body: "No matter your store\u2019s location or size, we can help you succeed."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '32px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => onNavigate('contact')
  }, "Learn more")))));
}
Object.assign(window, {
  Resources
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Resources.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Card = __ds_scope.Card;

__ds_ns.DashedSection = __ds_scope.DashedSection;

__ds_ns.ImageCard = __ds_scope.ImageCard;

__ds_ns.QuoteBlock = __ds_scope.QuoteBlock;

__ds_ns.ServiceCard = __ds_scope.ServiceCard;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.BarChart = __ds_scope.BarChart;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.CircleAction = __ds_scope.CircleAction;

__ds_ns.PlayButton = __ds_scope.PlayButton;

__ds_ns.VideoThumb = __ds_scope.VideoThumb;

__ds_ns.NavDropdown = __ds_scope.NavDropdown;

__ds_ns.Tabs = __ds_scope.Tabs;

})();

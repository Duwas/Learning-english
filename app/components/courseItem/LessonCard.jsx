
import React from 'react';

const LessonCard = ({ img, title, text, buttonLabel, buttonLink, colorClass }) => {
  
  
  const getCustomColors = (color) => {
    if (color === 'blue') return { headerBg: '#007bff', headerText: 'white', stripeBg: '#007bff', titleText: '#007bff', btnClass: 'color-blue' };
    if (color === 'pink') return { headerBg: '#FF69B4', headerText: 'white', stripeBg: '#FF69B4', titleText: '#FF69B4', btnClass: 'color-pink' };
    if (color === 'yellow') return { headerBg: '#FFC107', headerText: 'black', stripeBg: '#FFC107', titleText: '#FFC107', btnClass: 'color-yellow' };
    if (color === 'red') return { headerBg: '#e74c3c', headerText: 'white', stripeBg: '#e74c3c', titleText: '#e74c3c', btnClass: 'color-red' };
    if (color === 'orange') return { headerBg: '#f39c12', headerText: 'white', stripeBg: '#f39c12', titleText: '#f39c12', btnClass: 'color-orange' };
    if (color === 'purple') return { headerBg: '#9b59b6', headerText: 'white', stripeBg: '#9b59b6', titleText: '#9b59b6', btnClass: 'color-purple' };
    return { headerBg: '#6c757d', headerText: 'white', stripeBg: '#6c757d', titleText: '#6c757d', btnClass: 'color-secondary' };
  };

  const colors = getCustomColors(colorClass);
  const levels = ['A1', 'A2', 'B1']; 

  return (
    <div className="card shadow-sm h-100 overflow-hidden hover-lift rounded-3"> 
      
      <div className="position-relative" style={{ height: '21rem' }}>
        

        <img
          src={img.src}
          alt={title}
          className="card-img-top h-100 w-150"
          style={{ objectFit: 'cover', borderTopLeftRadius: '0.3rem', borderTopRightRadius: '0.3rem' }}
        />
        
        <div className="position-absolute bottom-0 w-100" style={{ backgroundColor: colors.stripeBg, height: '0.5rem' }}></div>
      </div>
      <div className="card-body d-flex flex-column">
        {/* Tiêu đề chính */}
        <h5 className="card-title fw-bold mb-2" style={{ color: colors.titleText }}>
          {title}
        </h5>
        
        {/* Nội dung mô tả */}
        <p className="card-text text-secondary small mb-3 flex-grow-1" style={{ minHeight: '90px' }}>
          {text}
        </p>

        {/* Hiển thị cấp độ */}
        <p className="small text-muted mb-3">
          Bao gồm: {levels.map((level, index) => (
            <span 
              key={level} 
              className={level === 'B1' ? 'text-success fw-semibold' : 'text-success fw-semibold'}
            >
              {level}{index < levels.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
        
        {/* Nút: ÁP DỤNG CLASS MÀU MỚI TẠI ĐÂY */}
        <a href={buttonLink || '#'} 
           className={`btn btn-sm mt-auto border-2 btn-radial-fill ${colors.btnClass}`} 
        >
          {buttonLabel}
        </a>
      </div>
    </div>
  );
};

export default LessonCard;
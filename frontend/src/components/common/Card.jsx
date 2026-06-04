const Card = ({ children, className = '', size = 'md' }) => {
  return (
    <div className={`${size === 'sm' ? 'card-sm' : 'card'} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
import { capitalize } from '../../utils/helpers';

const Badge = ({ status, className = '' }) => {
  return (
    <span className={`badge badge-${status} ${className}`}>
      {capitalize(status?.replace('_', ' '))}
    </span>
  );
};

export default Badge;
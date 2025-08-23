import { FaTwitter, FaLinkedin } from 'react-icons/fa';

const TeamMember = ({ name, role, bio, image }) => {
  // Función para generar imagen placeholder basada en el nombre
  const getPlaceholderImage = (name, image) => {
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F'];
    const colorIndex = name.length % colors.length;
    const initials = name.split(' ').map(n => n[0]).join('');
    return `https://via.placeholder.com/200x200/${colors[colorIndex]}/FFFFFF?text=${initials}`;
  };

  return (
    <div className="team-member">
      <div className="member-image">
        <img 
          src={getPlaceholderImage(name, image)}
          alt={name}
          loading="lazy"
        />
      </div>
      <div className="member-info">
        <h3>{name}</h3>
        <p className="member-role">{role}</p>
        <p className="member-bio">{bio}</p>
        <div className="member-social">
          <a href="#" aria-label={`Twitter de ${name}`}>
            <FaTwitter />
          </a>
          <a href="#" aria-label={`LinkedIn de ${name}`}>
            <FaLinkedin />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TeamMember;
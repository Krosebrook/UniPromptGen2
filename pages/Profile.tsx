

import React from 'react';
// Fix: Corrected import paths to be relative.
import { User } from '../types.ts';
import { StarIcon, SparklesIcon, ChartBarIcon } from '../components/icons/Icons.tsx';

interface ProfileProps {
  user: User;
}

const StatBox = ({ label, value, icon: Icon }: {label: string, value: string | number, icon: React.ElementType}) => (
    <div className="bg-secondary p-4 rounded-lg text-center">
        <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
    </div>
);

const Profile: React.FC<ProfileProps> = ({ user }) => {
  return (
    <div className="space-y-8">
      <div className="bg-card shadow-card rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
        <img src={user.avatarUrl} alt={user.name} className="h-28 w-28 rounded-full ring-4 ring-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
          <p className="text-lg text-primary">{user.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatBox label="Experience Points" value={user.xp.toLocaleString()} icon={SparklesIcon} />
            <StatBox label="Current Level" value={user.level} icon={ChartBarIcon} />
            <StatBox label="Achievements" value={user.achievements.length} icon={StarIcon} />
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card shadow-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Achievements</h2>
          <ul className="space-y-4">
            {user.achievements.map(ach => (
              <li key={ach.id} className="flex items-center">
                <div className="p-2 bg-warning/20 rounded-full mr-4">
                  <StarIcon className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{ach.name}</p>
                  <p className="text-sm text-muted-foreground">{ach.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-card shadow-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Certifications</h2>
          <ul className="space-y-4">
            {user.certifications.map(cert => (
              <li key={cert.id} className="flex items-center">
                <div className="p-2 bg-info/20 rounded-full mr-4">
                  <SparklesIcon className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{cert.name}</p>
                  <p className="text-sm text-muted-foreground">Issued by {cert.issuer} on {new Date(cert.date).toLocaleDateString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;
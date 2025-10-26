import React from 'react';
import Profile from '../../pages/Profile.tsx';
import { MOCK_LOGGED_IN_USER } from '../../constants.ts';

const ProfileSettings: React.FC = () => {
  // In a real app, you'd fetch the current user's data.
  // Here, we'll reuse the mock logged-in user.
  return <Profile user={MOCK_LOGGED_IN_USER} />;
};

export default ProfileSettings;
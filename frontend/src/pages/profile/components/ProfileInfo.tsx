interface ProfileInfoProps {
    name: string;
    username: string;
    bio?: string;
}

const ProfileInfo = ({ name, username, bio }: ProfileInfoProps) => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-1">{name}</h2>
        <p className="text-slate-500 text-lg">@{username}</p>
      </div>
      
      {bio && (
        <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{bio}</p>
        </div>
      )}
    </>
  );
};
  
  export default ProfileInfo;
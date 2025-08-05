import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import React from 'react';

const Register = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      console.log('Registering user with email:', email);
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('User registered successfully');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
      
    }
  };

  return (
    <div className='max-w-xl mx-auto mt-10 px-4'>
      <h1 className='text-3xl font-bold text-center mb-2'>Register</h1>
      <p className='text-center text-gray-600 mb-6'>
        Create an account to get started.
      </p>

      <form className='space-y-4' onSubmit={handleRegister}>
        <div>
          <label className='block text-sm font-medium text-gray-700'>Email</label>
          <Input
            type='email'
            placeholder='Enter your email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>Password</label>
          <Input
            type='password'
            placeholder='Enter your password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>Confirm Password</label>
          <Input
            type='password'
            placeholder='Confirm your password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button
          type='submit'
          className='w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700'
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </Button>

        {error && <p className='text-red-500 text-sm text-center'>{error}</p>}
      </form>
    </div>
  );
};

export default Register;

import React from 'react';
import { Container, Header, Title, Content } from '@oncolife/ui-components';
import { BookOpen } from 'lucide-react';

const EducationPage: React.FC = () => {
  return (
    <Container>
      <Header>
        <Title>Education</Title>
      </Header>
      
      <Content>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <BookOpen size={64} style={{ color: '#6b7280', marginBottom: '1rem' }} />
          <h2 style={{ color: '#374151', marginBottom: '0.5rem' }}>
            Education Resources
          </h2>
          <p style={{ color: '#6b7280', maxWidth: '500px' }}>
            Educational content and resources will be available here soon. 
            This section will provide helpful information about cancer treatment, 
            side effects, and wellness tips.
          </p>
        </div>
      </Content>
    </Container>
  );
};

export default EducationPage; 
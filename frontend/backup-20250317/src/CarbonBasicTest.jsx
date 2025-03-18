import React from 'react';
import { Button, Tag } from 'carbon-components-react';

const CarbonBasicTest = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Carbon Design System Basic Test</h1>
      <p>Testing if Carbon components render correctly</p>
      
      <div style={{ margin: '1rem 0' }}>
        <Button>Primary Button</Button>
      </div>
      
      <div>
        <Tag type="red">Error</Tag>
        <Tag type="green">Success</Tag>
      </div>
    </div>
  );
};

export default CarbonBasicTest;

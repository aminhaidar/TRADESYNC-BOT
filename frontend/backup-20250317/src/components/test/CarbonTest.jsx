import React from 'react';
import {
  Button,
  Tile,
  Tag,
  Grid,
  Row,
  Column
} from 'carbon-components-react';
import './CarbonTest.scss';

const CarbonTest = () => {
  return (
    <div className="carbon-test">
      <h1>Carbon Design System Test</h1>
      
      <Grid>
        <Row>
          <Column>
            <Tile className="test-tile">
              <h2>Basic Carbon Components</h2>
              <p>Testing that Carbon Design System is properly installed and styled.</p>
              
              <div className="button-row">
                <Button>Primary Button</Button>
                <Button kind="secondary">Secondary Button</Button>
                <Button kind="danger">Danger Button</Button>
                <Button kind="ghost">Ghost Button</Button>
              </div>
              
              <div className="tag-row">
                <Tag type="red">Error</Tag>
                <Tag type="green">Success</Tag>
                <Tag type="blue">Info</Tag>
                <Tag type="cyan">Debug</Tag>
                <Tag type="purple">Warning</Tag>
              </div>
            </Tile>
          </Column>
        </Row>
      </Grid>
    </div>
  );
};

export default CarbonTest;

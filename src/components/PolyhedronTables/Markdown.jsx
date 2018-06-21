// @flow strict
import _ from 'lodash';
import React from 'react';
import Markdown from 'react-markdown';
import { css, StyleSheet } from 'aphrodite/no-important';

import { media, fonts } from 'styles';

const styles = StyleSheet.create({
  // TODO change a lot of this to be from the surrounding element
  p: {
    fontSize: 16,
    fontFamily: fonts.hoeflerText,
    color: 'DimGrey',
    lineHeight: 1.5,
    marginBottom: 10,

    [media.mobile]: {
      fontSize: 14,
    },
  },

  a: {
    textDecoration: 'none',
    color: 'MediumBlue',

    ':hover': {
      textDecoration: 'underline',
    },
  },
  ul: {
    listStyle: 'disc',
    margin: '0 20px',
    marginBottom: 10,
  },

  li: {
    fontSize: 16,
    fontFamily: fonts.hoeflerText,
    color: 'DimGrey',
    lineHeight: 1.5,

    [media.mobile]: {
      fontSize: 14,
    },
  },

  em: {
    fontStyle: 'italic',
  },

  strong: {
    fontWeight: 'bold',
  },
});

function makeRenderer(El) {
  return props => {
    const allowedProps = _.pick(props, ['children', 'href']);
    return <El {...allowedProps} className={css(styles[El])} />;
  };
}

const renderers = {
  paragraph: makeRenderer('p'),
  linkReference: makeRenderer('a'),
  list: makeRenderer('ul'),
  listItem: makeRenderer('li'),
  emphasis: makeRenderer('em'),
  strong: makeRenderer('strong'),
};

interface Props {
  source: string;
}

export default ({ source }: Props) => {
  return <Markdown source={source} renderers={renderers} />;
};

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container my-4">
          <div className="alert alert-danger">
            <h5>Something went wrong</h5>
            <p>We caught an unexpected error. Try refreshing or contact the developer.</p>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error?.toString()}
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

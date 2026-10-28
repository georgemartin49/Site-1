import { render, screen, within } from '@testing-library/react';
import App from './App';
import site from './content/site.json';
import pubData from './content/publications.json';

const visit = path => {
  window.history.pushState({}, '', path);
  return render(<App />);
};

test.each(site.routes.map(r => [r.path, r.title]))('%s renders its own page with one h1', (path, title) => {
  visit(path);
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  expect(document.title).toBe(title);
  expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(site.origin + path);
});

test('paths without a trailing slash resolve to the same page', () => {
  visit('/publications');
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/publications and presentations/i);
});

test('an unknown address shows a not-found page that is not indexed', () => {
  visit('/no-such-page/');
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/page not found/i);
  expect(document.querySelector('meta[name="robots"]').getAttribute('content')).toBe('noindex');
});

test('navigation links carry real addresses and mark the current page', () => {
  visit('/cabot-edition/');
  const nav = screen.getByRole('navigation', { name: 'Main' });
  const link = within(nav).getByRole('link', { name: 'Cabot Edition' });
  expect(link).toHaveAttribute('href', '/cabot-edition/');
  expect(link).toHaveAttribute('aria-current', 'page');
});

test('the homepage notice and the publications list share one record for the trauma article', () => {
  const trauma = pubData.publications.find(p => p.id === 'trauma');
  visit('/');
  expect(screen.getByText(/has been published in/)).toHaveTextContent(trauma.title);
  visit('/publications/');
  expect(screen.getAllByText(new RegExp(trauma.title)).length).toBeGreaterThan(0);
});

test('no public page shows the edition sample until one is supplied', () => {
  visit('/cabot-edition/');
  expect(screen.queryByRole('heading', { name: /sample text/i })).toBeNull();
  expect(screen.queryByRole('link', { name: /sample/i })).toBeNull();
});

test('a direct visit to the sample address shows not-found while no sample is published', () => {
  visit('/cabot-edition/sample/');
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/page not found/i);
});

test('accepted talks stay listed as accepted after their month, without being called delivered', () => {
  jest.useFakeTimers().setSystemTime(new Date('2027-06-15'));
  visit('/publications/');
  const accepted = screen.getByRole('heading', { name: 'Accepted presentations' });
  const past = screen.getByRole('heading', { name: 'Selected past presentations' });
  const talk = screen.getByText(/After Dewey/);
  // listed after the Accepted heading and before the past-presentations heading
  expect(accepted.compareDocumentPosition(talk) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(past.compareDocumentPosition(talk) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  jest.useRealTimers();
});

test('the CV page offers the PDF, and the PDF was made from the current CV content', () => {
  const fs = require('fs');
  const path = require('path');
  const { cvFingerprint } = require('../scripts/cv-source');
  const made = require('./content/cv-pdf.json');
  visit('/cv/');
  const link = screen.getByRole('link', { name: 'Download CV as PDF' });
  expect(link).toHaveAttribute('href', `/${site.cv.pdf}`);
  expect(fs.existsSync(path.join(__dirname, '..', 'public', site.cv.pdf))).toBe(true);
  expect(made.fingerprint).toBe(cvFingerprint());
});

// Validation and normalisation for the profile form.
// Kept free of Firebase imports so it can be tested on its own.

export const NAME_MIN = 2
export const NAME_MAX = 40
export const COURSE_MAX = 60
export const ABOUT_MAX = 200

export const YEAR_OPTIONS = [
  '1st year',
  '2nd year',
  '3rd year',
  '4th year',
  'Postgraduate',
  'Other'
]

// Letters (any language), spaces, apostrophes, hyphens and full stops.
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u

export const normalizeProfile = (values) => ({
  displayName: (values.displayName || '').trim().replace(/\s+/g, ' '),
  course: (values.course || '').trim(),
  yearOfStudy: values.yearOfStudy || '',
  about: (values.about || '').trim()
})

// Returns an object of field -> message. Empty object means valid.
export const validateProfile = (values) => {
  const clean = normalizeProfile(values)
  const errors = {}

  if (clean.displayName.length < NAME_MIN) {
    errors.displayName = `Your name must be at least ${NAME_MIN} characters.`
  } else if (clean.displayName.length > NAME_MAX) {
    errors.displayName = `Your name must be ${NAME_MAX} characters or fewer.`
  } else if (!NAME_PATTERN.test(clean.displayName)) {
    errors.displayName =
      'Use letters, spaces, apostrophes, hyphens or full stops only.'
  }

  if (clean.course.length > COURSE_MAX) {
    errors.course = `Course must be ${COURSE_MAX} characters or fewer.`
  }

  if (clean.yearOfStudy && !YEAR_OPTIONS.includes(clean.yearOfStudy)) {
    errors.yearOfStudy = 'Please choose a year from the list.'
  }

  if (clean.about.length > ABOUT_MAX) {
    errors.about = `This must be ${ABOUT_MAX} characters or fewer.`
  }

  return errors
}

export const isSameProfile = (a, b) => {
  const x = normalizeProfile(a)
  const y = normalizeProfile(b)

  return (
    x.displayName === y.displayName &&
    x.course === y.course &&
    x.yearOfStudy === y.yearOfStudy &&
    x.about === y.about
  )
}
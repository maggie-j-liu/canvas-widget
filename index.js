const canvasRed = new Color("#F64453");
const smallWidgetConfig = {
  titleFontSize: 12,
  gradeFontSize: 14,
  scoreFontSize: 12,
  footerFontSize: 6,
  courseFontSize: 11,
  horizontalSpace: 6,
  listSpacerThreshold: 5, // anything larger will not have spacers between list items
  stackSpacerThreshold: 7, // anything larger will not have spacers between title, list, footer
};
const mediumWidgetConfig = {
  titleFontSize: 24,
  gradeFontSize: 28,
  scoreFontSize: 24,
  footerFontSize: 12,
  courseFontSize: 22,
  horizontalSpace: 12,
  spacers: false,
};
const largeWidgetConfig = {
  titleFontSize: 24,
  gradeFontSize: 28,
  scoreFontSize: 24,
  footerFontSize: 12,
  courseFontSize: 22,
  horizontalSpace: 12,
  listSpacerThreshold: 7,
  stackSpacerThreshold: 8,
};
const createWidget = async ({
  titleFontSize,
  gradeFontSize,
  scoreFontSize,
  footerFontSize,
  courseFontSize,
  horizontalSpace,
  listSpacerThreshold,
  stackSpacerThreshold,
}) => {
  // create widget
  const widget = new ListWidget();

  // get data and filter to courses with grades and scores
  const courseData = await getData();
  const coursesToDisplay = courseData.filter(
    (x) => x.current_score || x.current_grade
  );
  const numCourses = coursesToDisplay.length;

  // create title
  const title = widget.addText("Canvas Grades");
  if (numCourses <= stackSpacerThreshold) {
    widget.addSpacer();
  }
  title.textColor = canvasRed;
  title.font = Font.boldSystemFont(titleFontSize);

  // create list
  for (const course of coursesToDisplay) {
    if (!course.current_grade && !course.current_score) continue;
    const stack = widget.addStack();
    if (numCourses <= listSpacerThreshold) {
      widget.addSpacer();
    }
    if (course.current_grade) {
      const text = stack.addText(course.current_grade);
      text.font = Font.semiboldSystemFont(gradeFontSize);
      stack.addSpacer(horizontalSpace);
    }
    if (course.current_score) {
      const text = stack.addText("" + course.current_score);
      text.font = Font.regularSystemFont(scoreFontSize);
      stack.addSpacer(null);
    }
    const shortenedName = course.name.split(" - ")[0];
    const text = stack.addText(shortenedName);
    text.font = Font.lightSystemFont(courseFontSize);
    text.textColor = Color.gray();
    stack.bottomAlignContent();
  }
  if (numCourses > listSpacerThreshold && numCourses <= stackSpacerThreshold) {
    widget.addSpacer();
  }
  const footer = widget.addText(
    `Last updated at ${new Date().toLocaleString()}`
  );
  footer.font = Font.lightSystemFont(footerFontSize);
  footer.textColor = Color.lightGray();
  return widget;
};

const BASE_URL = "https://sjusd.instructure.com";
const TOKEN = "your_token_here";

const getData = async () => {
  if (TOKEN === "your_token_here") {
    throw new Error(
      "Please replace `your_token_here` with your own Canvas access token. See https://community.canvaslms.com/t5/Student-Guide/How-do-I-manage-API-access-tokens-as-a-student/ta-p/273 for more information."
    );
  }
  const req = new Request(
    `${BASE_URL}/api/v1/courses?enrollment_state=active&include[]=total_scores`
  );
  req.headers = {
    Authorization: `Bearer ${TOKEN}`,
  };
  const res = await req.loadJSON();
  const filteredData = res.map((course) => ({
    name: course.name,
    current_grade: course.enrollments[0].computed_current_grade,
    current_score: course.enrollments[0].computed_current_score,
  }));
  /*
  const mockData = [
    { name: "asdf", current_grade: "A", current_score: 100 },
    { name: "asdf", current_grade: "A", current_score: 100 },
    { name: "asdf", current_grade: "A", current_score: 100 },
    { name: "asdf", current_grade: "A", current_score: 100 },
    { name: "asdf", current_grade: "A", current_score: 100 },
    { name: "asdf", current_grade: "A", current_score: 100 },
    { name: "asdf", current_grade: "A", current_score: 100 },
    { name: "asdf", current_grade: "A", current_score: 100 },
    { name: "asdf", current_grade: "A", current_score: 100 },
  ];
  return mockData;
  */
  return filteredData;
};

let sizedConfig = largeWidgetConfig;
if (config.widgetFamily === "small") {
  sizedConfig = smallWidgetConfig;
} else if (config.widgetFamily === "medium") {
  sizedConfig = mediumWidgetConfig;
} else if (!config.widgetFamily) {
  sizedConfig = smallWidgetConfig;
}

const w = await createWidget(sizedConfig);
if (!config.runsInWidget) {
  await w.presentSmall();
}
Script.setWidget(w);
Script.complete();

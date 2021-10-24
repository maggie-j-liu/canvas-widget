let BASE_URL = "https://sjusd.instructure.com";
let TOKEN;

const canvasRed = new Color("#F64453");
const configs = {
  small: {
    titleFontSize: 12,
    gradeFontSize: 14,
    scoreFontSize: 12,
    footerFontSize: 6,
    courseFontSize: 11,
    horizontalSpace: 6,
    listSpacerThreshold: 5, // anything larger will not have spacers between list items
    stackSpacerThreshold: 7, // anything larger will not have spacers between title, list, footer
  },
  medium: {
    titleFontSize: 18,
    gradeFontSize: 14,
    scoreFontSize: 12,
    footerFontSize: 8,
    courseFontSize: 11,
    horizontalSpace: 6,
    listSpacerThreshold: 5,
    stackSpacerThreshold: 7,
  },
  large: {
    titleFontSize: 24,
    gradeFontSize: 28,
    scoreFontSize: 24,
    footerFontSize: 12,
    courseFontSize: 22,
    horizontalSpace: 12,
    listSpacerThreshold: 7,
    stackSpacerThreshold: 8,
  },
};

const createWidget = async (type) => {
  const {
    stackSpacerThreshold,
    titleFontSize,
    listSpacerThreshold,
    footerFontSize,
  } = configs[type];
  // create widget
  const widget = new ListWidget();
  widget.url =
    URLScheme.forRunningScript() + "?token=" + TOKEN + "&size=" + type;
  let mainStack = widget.addStack();
  mainStack.layoutVertically();

  // get data and filter to courses with grades and scores
  const courseData = await getData();
  const coursesToDisplay = courseData.filter(
    (x) => x.current_score || x.current_grade
  );
  const numCourses = coursesToDisplay.length;

  // create title
  const title = mainStack.addText("Canvas Grades");
  if (numCourses <= stackSpacerThreshold) {
    mainStack.addSpacer();
  }
  title.textColor = canvasRed;
  title.font = Font.boldSystemFont(titleFontSize);

  if (type === "medium") {
    const half = Math.ceil(coursesToDisplay.length / 2);
    const firstList = coursesToDisplay.slice(0, half);
    const secondList = coursesToDisplay.slice(half);
    if (coursesToDisplay.length % 2 === 1) {
      secondList.push({
        name: " ",
        current_score: "",
        current_grade: "",
      });
    }
    const listStack = mainStack.addStack();
    const firstStack = listStack.addStack();
    firstStack.layoutVertically();
    listStack.addSpacer(24);
    const secondStack = listStack.addStack();
    secondStack.layoutVertically();
    createList(firstStack, firstList, type);
    createList(secondStack, secondList, type);
    if (coursesToDisplay.length % 2 === 1) {
      const s = secondStack.addStack();
      s.addText(" ");
      if (secondList.length <= listSpacerThreshold) {
        secondStack.addSpacer();
      }
    }
  } else {
    createList(mainStack, coursesToDisplay, type);
  }

  if (numCourses > listSpacerThreshold && numCourses <= stackSpacerThreshold) {
    mainStack.addSpacer();
  }
  const footer = mainStack.addText(
    `Last updated at ${new Date().toLocaleString()}`
  );
  footer.font = Font.lightSystemFont(footerFontSize);
  footer.textColor = Color.lightGray();
  return widget;
};
const createList = (mainStack, courses, type) => {
  const {
    listSpacerThreshold,
    gradeFontSize,
    horizontalSpace,
    scoreFontSize,
    courseFontSize,
  } = configs[type];
  // create list
  for (const course of courses) {
    if (!course.current_grade && !course.current_score) continue;
    const stack = mainStack.addStack();
    if (courses.length <= listSpacerThreshold) {
      mainStack.addSpacer();
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
    text.lineLimit = 1;
    stack.bottomAlignContent();
  }
};

const getData = async () => {
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
    { name: "just pretend", current_grade: "A+", current_score: 101 },
    { name: "these are", current_grade: "B", current_score: 86.7 },
    { name: "real", current_grade: "C", current_score: 70.3 },
    { name: "grades", current_grade: "D", current_score: 67.1 },
    { name: "or something", current_grade: "F", current_score: 50 },
  ];
  return mockData;
  */
  return filteredData;
};

let size = config.widgetFamily;
if (!config.widgetFamily) {
  size = "medium";
}

let w;
if (!config.runsInWidget) {
  if (!args.queryParameters.token || !args.queryParameters.baseUrl) {
    throw new Error(
      `To run this script in the app, go to ${URLScheme.forRunningScript()}?baseUrl=your_canvas_baseurl&token=your_token, replacing your_canvas_baseurl with your organization's Canvas url (for example, https://sjusd.instructure.com) and your_token with your Canvas access token. Or, run this script as a widget.`
    );
  }

  TOKEN = args.queryParameters.token;
  BASE_URL = args.queryParameters.baseUrl;
  if (["small", "medium", "large"].includes(args.queryParameters.size)) {
    size = args.queryParameters.size;
  }
  w = await createWidget(size);
  if (size === "small") {
    await w.presentSmall();
  } else if (size === "medium") {
    await w.presentMedium();
  } else {
    await w.presentLarge();
  }
} else {
  const errorMessage =
    "Configure the widget paramter in the form of baseUrl|token, where baseUrl is your Canvas url and token is your Canvas access token.";
  const rawWidgetParameter = args.widgetParameter;
  if (!rawWidgetParameter) {
    throw new Error(errorMessage);
  }
  const rawArgs = rawWidgetParameter.split("|");
  if (rawArgs.length !== 2) {
    throw new Error(errorMessage);
  }
  BASE_URL = rawArgs[0];
  TOKEN = rawArgs[1];
  w = await createWidget(size);
  if (!args.widgetParameter) {
    throw new Error(
      "Please configure the widget with your own Canvas access token. See https://community.canvaslms.com/t5/Student-Guide/How-do-I-manage-API-access-tokens-as-a-student/ta-p/273 for more information."
    );
  }
}
Script.setWidget(w);
Script.complete();

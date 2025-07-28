## Learning Outcomes[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#learning-outcomes "Permanent link")

1.  Identify the difference between decomposition-based integration testing and call graph-based integration testing.
2.  Conduct integration test using Jest.
3.  Derive system testing test cases based on the user case documentations.
4.  Develop testing strategies based different software development life cycle.

## Levels of testing[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#levels-of-testing "Permanent link")

Recall

-   Unit testing - test individual smallest units of the system.
-   Integration testing - test related units/subcomponents of the system, which are related (according to the system design)
-   System testing - test the system as a whole, (often according to the user cases).

In this unit, we study integration testing.

## Integration Test[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#integration-test "Permanent link")

There are two main approaches of performing integration tests

-   Decomposition-based testing
-   Call graph-based testing

### Decomposition-based testing[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#decomposition-based-testing "Permanent link")

In Decomposition-based integration testing, we follow the modular structure of the system design.

We perform integration test by following the structure. There are two possible directions. 1. Top-down integration testing 1. Bottom-up integration testing

#### Top-Down Integration testing[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#top-down-integration-testing "Permanent link")

In top-down decomposition-based integration testing, we mock up all the sub-components below the main program, and test the main program.

We put an asterix to denote that function is mocked. After the main program being tested against the mocked functions, we start to replace the mockded codes with the actual codes starting from the first left child until the bottom right child following the breadth first search order.

The rationale of the top-down integration test is that when we encounter an error, the error must be caused by the integration of the newly unmocked code.

#### Bottom-up Integration testing[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#bottom-up-integration-testing "Permanent link")

Bottom-up decomposition-based integration testing starts from the bottom left-most or the right most leaf function. We test the leaf functions by making use of the unit test codes (now we call it the driver code).

Note that in the above diagram, the components associated with an asterix are yet to be integrated in the integration test. We then move up the structure by integrating the parents of the leaf functions, (and using the unit test code). We repeat the process until we reach the top.

By doing so, we need not mock up the code as we can reuse (or modify) the unit-test code as drivers.

#### Limitation[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#limitation "Permanent link")

The limitation of decomposition-based testing is that the structure is defined by the lexical structure of the source code (definition structure), which often does not reflect the execution and function call relation.

For example, recall in our Echo App (the restful API version), we have two major components in the app. By following the code structure we have.

However, we find that we hardly have code from app to call MessageModel directly. In most of the situation, the call sequence is app→EchoRouter→MessageModel.

### Call-graph based integration[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#call-graph-based-integration "Permanent link")

To address the issue with Decomposition based integration, we define the integration structure by following the call graph. For instance, here is the call graph of our Echo App

Note that `insertMany()` is never used.

Now we can apply the similar top-down or bottom-up integration test strategies.

#### Example[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#example "Permanent link")

We reuse the `my_mysql_app` developed in the earlier units. We start by including `jest` and `supertest` in the project

and modify `package.json` to change

<table><tbody><tr><td></td><td><div><pre id="__code_1"><span></span><code><span id="__span-1-1"><a id="__codelineno-1-1" name="__codelineno-1-1"></a><span>  </span><span>"scripts"</span><span>:</span><span> </span><span>{</span>
</span><span id="__span-1-2"><a id="__codelineno-1-2" name="__codelineno-1-2"></a><span>    </span><span>"start"</span><span>:</span><span> </span><span>"node ./bin/www"</span>
</span><span id="__span-1-3"><a id="__codelineno-1-3" name="__codelineno-1-3"></a><span>  </span><span>},</span>
</span></code></pre></div></td></tr></tbody></table>

to

<table><tbody><tr><td></td><td><div><pre id="__code_2"><span></span><code><span id="__span-2-1"><a id="__codelineno-2-1" name="__codelineno-2-1"></a><span>  </span><span>"scripts"</span><span>:</span><span> </span><span>{</span>
</span><span id="__span-2-2"><a id="__codelineno-2-2" name="__codelineno-2-2"></a><span>    </span><span>"start"</span><span>:</span><span> </span><span>"node ./bin/www"</span><span>,</span>
</span><span id="__span-2-3"><a id="__codelineno-2-3" name="__codelineno-2-3"></a><span>    </span><span>"test"</span><span>:</span><span> </span><span>"jest"</span><span> </span><span>// added </span>
</span><span id="__span-2-4"><a id="__codelineno-2-4" name="__codelineno-2-4"></a><span>  </span><span>},</span>
</span></code></pre></div></td></tr></tbody></table>

Then we create a sub folder `__test__` under the project root folder.

Now we should have a project folder structure as the following

<table><tbody><tr><td><div><pre><span></span><span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-1"> 1</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-2"> 2</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-3"> 3</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-4"> 4</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-5"> 5</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-6"> 6</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-7"> 7</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-8"> 8</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-9"> 9</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-10">10</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-11">11</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-12">12</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-13">13</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-14">14</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-15">15</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-16">16</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-17">17</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-18">18</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-19">19</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-20">20</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-3-21">21</a></span></pre></div></td><td><div><pre id="__code_3"><span></span><code><span id="__span-3-1"><a id="__codelineno-3-1" name="__codelineno-3-1"></a>.
</span><span id="__span-3-2"><a id="__codelineno-3-2" name="__codelineno-3-2"></a>├── __test__
</span><span id="__span-3-3"><a id="__codelineno-3-3" name="__codelineno-3-3"></a>├── app.js
</span><span id="__span-3-4"><a id="__codelineno-3-4" name="__codelineno-3-4"></a>├── bin
</span><span id="__span-3-5"><a id="__codelineno-3-5" name="__codelineno-3-5"></a>│   └── www
</span><span id="__span-3-6"><a id="__codelineno-3-6" name="__codelineno-3-6"></a>├── models
</span><span id="__span-3-7"><a id="__codelineno-3-7" name="__codelineno-3-7"></a>│   ├── db.js
</span><span id="__span-3-8"><a id="__codelineno-3-8" name="__codelineno-3-8"></a>│   └── message.js
</span><span id="__span-3-9"><a id="__codelineno-3-9" name="__codelineno-3-9"></a>├── package.json
</span><span id="__span-3-10"><a id="__codelineno-3-10" name="__codelineno-3-10"></a>├── public
</span><span id="__span-3-11"><a id="__codelineno-3-11" name="__codelineno-3-11"></a>│   ├── images
</span><span id="__span-3-12"><a id="__codelineno-3-12" name="__codelineno-3-12"></a>│   ├── javascripts
</span><span id="__span-3-13"><a id="__codelineno-3-13" name="__codelineno-3-13"></a>│   └── stylesheets
</span><span id="__span-3-14"><a id="__codelineno-3-14" name="__codelineno-3-14"></a>│       └── style.css
</span><span id="__span-3-15"><a id="__codelineno-3-15" name="__codelineno-3-15"></a>├── routes
</span><span id="__span-3-16"><a id="__codelineno-3-16" name="__codelineno-3-16"></a>│   ├── index.js
</span><span id="__span-3-17"><a id="__codelineno-3-17" name="__codelineno-3-17"></a>│   ├── echo.js
</span><span id="__span-3-18"><a id="__codelineno-3-18" name="__codelineno-3-18"></a>│   └── users.js
</span><span id="__span-3-19"><a id="__codelineno-3-19" name="__codelineno-3-19"></a>└── views
</span><span id="__span-3-20"><a id="__codelineno-3-20" name="__codelineno-3-20"></a>    ├── error.ejs
</span><span id="__span-3-21"><a id="__codelineno-3-21" name="__codelineno-3-21"></a>    └── index.ejs
</span></code></pre></div></td></tr></tbody></table>

##### Unit Testing Model message.all[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#unit-testing-model-messageall "Permanent link")

First we define a unit test on on `models/message.js`'s function `all()`.

In the `__test__` folder we add a test file `message.test.js` with the following content

<table><tbody><tr><td><div><pre><span></span><span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-1"> 1</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-2"> 2</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-3"> 3</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-4"> 4</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-5"> 5</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-6"> 6</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-7"> 7</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-8"> 8</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-9"> 9</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-10">10</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-11">11</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-12">12</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-13">13</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-14">14</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-15">15</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-16">16</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-17">17</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-18">18</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-19">19</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-20">20</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-21">21</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-22">22</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-23">23</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-24">24</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-25">25</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-26">26</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-27">27</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-28">28</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-29">29</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-30">30</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-31">31</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-32">32</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-33">33</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-34">34</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-35">35</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-36">36</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-37">37</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-38">38</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-39">39</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-40">40</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-41">41</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-42">42</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-43">43</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-44">44</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-45">45</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-46">46</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-4-47">47</a></span></pre></div></td><td><div><pre id="__code_4"><span></span><code tabindex="0"><span id="__span-4-1"><a id="__codelineno-4-1" name="__codelineno-4-1"></a><span>const</span><span> </span><span>db</span><span> </span><span>=</span><span> </span><span>require</span><span>(</span><span>'../../models/db.js'</span><span>);</span>
</span><span id="__span-4-2"><a id="__codelineno-4-2" name="__codelineno-4-2"></a><span>const</span><span> </span><span>message</span><span> </span><span>=</span><span> </span><span>require</span><span>(</span><span>'../../models/message.js'</span><span>);</span>
</span><span id="__span-4-3"><a id="__codelineno-4-3" name="__codelineno-4-3"></a>
</span><span id="__span-4-4"><a id="__codelineno-4-4" name="__codelineno-4-4"></a><span>async</span><span> </span><span>function</span><span> </span><span>setup</span><span>()</span><span> </span><span>{</span>
</span><span id="__span-4-5"><a id="__codelineno-4-5" name="__codelineno-4-5"></a><span>    </span><span>try</span><span> </span><span>{</span>
</span><span id="__span-4-6"><a id="__codelineno-4-6" name="__codelineno-4-6"></a><span>        </span><span>await</span><span> </span><span>db</span><span>.</span><span>pool</span><span>.</span><span>query</span><span>(</span><span>`</span>
</span><span id="__span-4-7"><a id="__codelineno-4-7" name="__codelineno-4-7"></a><span>            DELETE FROM message;`</span>
</span><span id="__span-4-8"><a id="__codelineno-4-8" name="__codelineno-4-8"></a><span>        </span><span>);</span>
</span><span id="__span-4-9"><a id="__codelineno-4-9" name="__codelineno-4-9"></a><span>        </span><span>await</span><span> </span><span>db</span><span>.</span><span>pool</span><span>.</span><span>query</span><span>(</span><span>`</span>
</span><span id="__span-4-10"><a id="__codelineno-4-10" name="__codelineno-4-10"></a><span>            INSERT INTO message (msg, time) </span>
</span><span id="__span-4-11"><a id="__codelineno-4-11" name="__codelineno-4-11"></a><span>            VALUES ('msg a', '2009-01-01:00:00:00'),</span>
</span><span id="__span-4-12"><a id="__codelineno-4-12" name="__codelineno-4-12"></a><span>                   ('msg b', '2009-01-02:00:00:00')</span>
</span><span id="__span-4-13"><a id="__codelineno-4-13" name="__codelineno-4-13"></a><span>        `</span><span>);</span>
</span><span id="__span-4-14"><a id="__codelineno-4-14" name="__codelineno-4-14"></a><span>    </span><span>}</span><span> </span><span>catch</span><span> </span><span>(</span><span>error</span><span>)</span><span> </span><span>{</span>
</span><span id="__span-4-15"><a id="__codelineno-4-15" name="__codelineno-4-15"></a><span>        </span><span>console</span><span>.</span><span>error</span><span>(</span><span>"setup failed. "</span><span> </span><span>+</span><span> </span><span>error</span><span>);</span>
</span><span id="__span-4-16"><a id="__codelineno-4-16" name="__codelineno-4-16"></a><span>        </span><span>throw</span><span> </span><span>error</span><span>;</span>
</span><span id="__span-4-17"><a id="__codelineno-4-17" name="__codelineno-4-17"></a><span>    </span><span>}</span>
</span><span id="__span-4-18"><a id="__codelineno-4-18" name="__codelineno-4-18"></a><span>}</span>
</span><span id="__span-4-19"><a id="__codelineno-4-19" name="__codelineno-4-19"></a>
</span><span id="__span-4-20"><a id="__codelineno-4-20" name="__codelineno-4-20"></a><span>async</span><span> </span><span>function</span><span> </span><span>teardown</span><span>()</span><span> </span><span>{</span>
</span><span id="__span-4-21"><a id="__codelineno-4-21" name="__codelineno-4-21"></a><span>    </span><span>try</span><span> </span><span>{</span>
</span><span id="__span-4-22"><a id="__codelineno-4-22" name="__codelineno-4-22"></a><span>        </span><span>await</span><span> </span><span>db</span><span>.</span><span>pool</span><span>.</span><span>query</span><span>(</span><span>`</span>
</span><span id="__span-4-23"><a id="__codelineno-4-23" name="__codelineno-4-23"></a><span>            DELETE FROM message;`</span>
</span><span id="__span-4-24"><a id="__codelineno-4-24" name="__codelineno-4-24"></a><span>        </span><span>);</span>
</span><span id="__span-4-25"><a id="__codelineno-4-25" name="__codelineno-4-25"></a><span>        </span><span>await</span><span> </span><span>db</span><span>.</span><span>cleanup</span><span>();</span>
</span><span id="__span-4-26"><a id="__codelineno-4-26" name="__codelineno-4-26"></a><span>    </span><span>}</span><span> </span><span>catch</span><span> </span><span>(</span><span>error</span><span>)</span><span> </span><span>{</span>
</span><span id="__span-4-27"><a id="__codelineno-4-27" name="__codelineno-4-27"></a><span>        </span><span>console</span><span>.</span><span>error</span><span>(</span><span>"teardown failed. "</span><span> </span><span>+</span><span> </span><span>error</span><span>);</span>
</span><span id="__span-4-28"><a id="__codelineno-4-28" name="__codelineno-4-28"></a><span>        </span><span>throw</span><span> </span><span>error</span><span>;</span>
</span><span id="__span-4-29"><a id="__codelineno-4-29" name="__codelineno-4-29"></a><span>    </span><span>}</span>
</span><span id="__span-4-30"><a id="__codelineno-4-30" name="__codelineno-4-30"></a><span>}</span>
</span><span id="__span-4-31"><a id="__codelineno-4-31" name="__codelineno-4-31"></a>
</span><span id="__span-4-32"><a id="__codelineno-4-32" name="__codelineno-4-32"></a><span>describe</span><span>(</span><span>"models.message.all() tests"</span><span>,</span><span> </span><span>()</span><span> </span><span>=&gt;</span><span> </span><span>{</span>
</span><span id="__span-4-33"><a id="__codelineno-4-33" name="__codelineno-4-33"></a><span>    </span><span>beforeAll</span><span>(</span><span>async</span><span> </span><span>()</span><span> </span><span>=&gt;</span><span> </span><span>{</span>
</span><span id="__span-4-34"><a id="__codelineno-4-34" name="__codelineno-4-34"></a><span>        </span><span>await</span><span> </span><span>setup</span><span>();</span>
</span><span id="__span-4-35"><a id="__codelineno-4-35" name="__codelineno-4-35"></a><span>    </span><span>});</span>
</span><span id="__span-4-36"><a id="__codelineno-4-36" name="__codelineno-4-36"></a><span>    </span><span>test</span><span> </span><span>(</span><span>"testing message.all()"</span><span>,</span><span> </span><span>()</span><span> </span><span>=&gt;</span><span> </span><span>{</span>
</span><span id="__span-4-37"><a id="__codelineno-4-37" name="__codelineno-4-37"></a><span>        </span><span>const</span><span> </span><span>expected</span><span> </span><span>=</span><span> </span><span>[</span><span> </span><span>new</span><span> </span><span>message</span><span>.</span><span>Message</span><span>(</span><span>'msg a'</span><span>,</span><span> </span><span>new</span><span> </span><span>Date</span><span>(</span><span>'2009-01-01:00:00:00'</span><span>)),</span><span> </span>
</span><span id="__span-4-38"><a id="__codelineno-4-38" name="__codelineno-4-38"></a><span>                           </span><span>new</span><span> </span><span>message</span><span>.</span><span>Message</span><span>(</span><span>'msg b'</span><span>,</span><span> </span><span>new</span><span> </span><span>Date</span><span>(</span><span>'2009-01-02:00:00:00'</span><span>))]</span>
</span><span id="__span-4-39"><a id="__codelineno-4-39" name="__codelineno-4-39"></a><span>        </span><span>const</span><span> </span><span>result_promise</span><span> </span><span>=</span><span> </span><span>message</span><span>.</span><span>all</span><span>();</span>
</span><span id="__span-4-40"><a id="__codelineno-4-40" name="__codelineno-4-40"></a><span>        </span><span>result_promise</span><span>.</span><span>then</span><span>((</span><span>result</span><span>)</span><span> </span><span>=&gt;</span><span> </span><span>{</span>
</span><span id="__span-4-41"><a id="__codelineno-4-41" name="__codelineno-4-41"></a><span>            </span><span>expect</span><span>(</span><span>result</span><span>.</span><span>sort</span><span>()).</span><span>toEqual</span><span>(</span><span>expected</span><span>.</span><span>sort</span><span>());</span>
</span><span id="__span-4-42"><a id="__codelineno-4-42" name="__codelineno-4-42"></a><span>        </span><span>});</span>
</span><span id="__span-4-43"><a id="__codelineno-4-43" name="__codelineno-4-43"></a><span>    </span><span>});</span>
</span><span id="__span-4-44"><a id="__codelineno-4-44" name="__codelineno-4-44"></a><span>    </span><span>afterAll</span><span>(</span><span>async</span><span> </span><span>()</span><span> </span><span>=&gt;</span><span> </span><span>{</span>
</span><span id="__span-4-45"><a id="__codelineno-4-45" name="__codelineno-4-45"></a><span>        </span><span>await</span><span> </span><span>teardown</span><span>();</span>
</span><span id="__span-4-46"><a id="__codelineno-4-46" name="__codelineno-4-46"></a><span>    </span><span>});</span>
</span><span id="__span-4-47"><a id="__codelineno-4-47" name="__codelineno-4-47"></a><span>})</span>
</span></code></pre></div></td></tr></tbody></table>

The `setup` and `teardown` define the setup and tear-down routine of this test suite. Note that in the actual project, you might consider backing up and restoring the actual table data in the `setup` and `teardown` functions.

In the test suite, we define only one test.

When we run

<table><tbody><tr><td></td><td><div><pre id="__code_5"><span></span><code><span id="__span-5-1"><a id="__codelineno-5-1" name="__codelineno-5-1"></a>npm<span> </span>run<span> </span><span>test</span><span> </span>message.test.js
</span></code></pre></div></td></tr></tbody></table>

we see

<table><tbody><tr><td><div><pre><span></span><span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-1"> 1</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-2"> 2</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-3"> 3</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-4"> 4</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-5"> 5</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-6"> 6</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-7"> 7</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-8"> 8</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-9"> 9</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-10">10</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-11">11</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-12">12</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-13">13</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-14">14</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-15">15</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-16">16</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-6-17">17</a></span></pre></div></td><td><div><pre id="__code_6"><span></span><code><span id="__span-6-1"><a id="__codelineno-6-1" name="__codelineno-6-1"></a>&gt;<span> </span>my-mysql-app@0.0.0<span> </span><span>test</span>
</span><span id="__span-6-2"><a id="__codelineno-6-2" name="__codelineno-6-2"></a>&gt;<span> </span>jest<span> </span>--detectOpenHandles<span> </span>message.test.js
</span><span id="__span-6-3"><a id="__codelineno-6-3" name="__codelineno-6-3"></a>
</span><span id="__span-6-4"><a id="__codelineno-6-4" name="__codelineno-6-4"></a><span>  </span>console.log
</span><span id="__span-6-5"><a id="__codelineno-6-5" name="__codelineno-6-5"></a><span>    </span><span>2</span>
</span><span id="__span-6-6"><a id="__codelineno-6-6" name="__codelineno-6-6"></a>
</span><span id="__span-6-7"><a id="__codelineno-6-7" name="__codelineno-6-7"></a><span>      </span>at<span> </span>Object.log<span> </span><span>(</span>models/message.js:36:17<span>)</span>
</span><span id="__span-6-8"><a id="__codelineno-6-8" name="__codelineno-6-8"></a>
</span><span id="__span-6-9"><a id="__codelineno-6-9" name="__codelineno-6-9"></a><span> </span>PASS<span>  </span>__test__/models/message.test.js
</span><span id="__span-6-10"><a id="__codelineno-6-10" name="__codelineno-6-10"></a><span>  </span>models.message.all<span>()</span><span> </span>tests
</span><span id="__span-6-11"><a id="__codelineno-6-11" name="__codelineno-6-11"></a><span>    </span>✓<span> </span>testing<span> </span>message.all<span>()</span><span> </span><span>(</span><span>3</span><span> </span>ms<span>)</span>
</span><span id="__span-6-12"><a id="__codelineno-6-12" name="__codelineno-6-12"></a>
</span><span id="__span-6-13"><a id="__codelineno-6-13" name="__codelineno-6-13"></a>Test<span> </span>Suites:<span> </span><span>1</span><span> </span>passed,<span> </span><span>1</span><span> </span>total
</span><span id="__span-6-14"><a id="__codelineno-6-14" name="__codelineno-6-14"></a>Tests:<span>       </span><span>1</span><span> </span>passed,<span> </span><span>1</span><span> </span>total
</span><span id="__span-6-15"><a id="__codelineno-6-15" name="__codelineno-6-15"></a>Snapshots:<span>   </span><span>0</span><span> </span>total
</span><span id="__span-6-16"><a id="__codelineno-6-16" name="__codelineno-6-16"></a>Time:<span>        </span><span>0</span>.496<span> </span>s,<span> </span>estimated<span> </span><span>1</span><span> </span>s
</span><span id="__span-6-17"><a id="__codelineno-6-17" name="__codelineno-6-17"></a>Ran<span> </span>all<span> </span><span>test</span><span> </span>suites<span> </span>matching<span> </span>/message.test.js/i.
</span></code></pre></div></td></tr></tbody></table>

##### Integration Test with Echo Router and Model message.all[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#integration-test-with-echo-router-and-model-messageall "Permanent link")

Next we define a bottom-up integration testing by integrating the path from `get.all` to `message.all()`.

In the `__test__` folder we define a new test file `echo.test.js` with the following content

<table><tbody><tr><td><div><pre><span></span><span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-1"> 1</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-2"> 2</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-3"> 3</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-4"> 4</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-5"> 5</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-6"> 6</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-7"> 7</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-8"> 8</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-9"> 9</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-10">10</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-11">11</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-12">12</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-13">13</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-14">14</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-15">15</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-16">16</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-17">17</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-18">18</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-19">19</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-20">20</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-21">21</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-22">22</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-23">23</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-24">24</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-25">25</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-26">26</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-27">27</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-28">28</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-29">29</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-30">30</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-31">31</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-32">32</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-33">33</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-34">34</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-35">35</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-36">36</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-37">37</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-38">38</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-39">39</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-40">40</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-41">41</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-42">42</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-43">43</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-44">44</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-45">45</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-46">46</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-47">47</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-48">48</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-49">49</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-50">50</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-51">51</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-52">52</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-53">53</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-54">54</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-55">55</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-7-56">56</a></span></pre></div></td><td><div><pre id="__code_7"><span></span><code tabindex="0"><span id="__span-7-1"><a id="__codelineno-7-1" name="__codelineno-7-1"></a><span>const</span><span> </span><span>db</span><span> </span><span>=</span><span> </span><span>require</span><span>(</span><span>'../../models/db.js'</span><span>);</span>
</span><span id="__span-7-2"><a id="__codelineno-7-2" name="__codelineno-7-2"></a><span>const</span><span> </span><span>message</span><span> </span><span>=</span><span> </span><span>require</span><span>(</span><span>'../../models/message.js'</span><span>);</span>
</span><span id="__span-7-3"><a id="__codelineno-7-3" name="__codelineno-7-3"></a><span>const</span><span> </span><span>request</span><span> </span><span>=</span><span> </span><span>require</span><span>(</span><span>'supertest'</span><span>)</span>
</span><span id="__span-7-4"><a id="__codelineno-7-4" name="__codelineno-7-4"></a><span>const</span><span> </span><span>app</span><span> </span><span>=</span><span> </span><span>require</span><span>(</span><span>'../../app'</span><span>);</span>
</span><span id="__span-7-5"><a id="__codelineno-7-5" name="__codelineno-7-5"></a>
</span><span id="__span-7-6"><a id="__codelineno-7-6" name="__codelineno-7-6"></a><span>async</span><span> </span><span>function</span><span> </span><span>setup</span><span>()</span><span> </span><span>{</span>
</span><span id="__span-7-7"><a id="__codelineno-7-7" name="__codelineno-7-7"></a><span>    </span><span>try</span><span> </span><span>{</span>
</span><span id="__span-7-8"><a id="__codelineno-7-8" name="__codelineno-7-8"></a><span>        </span><span>// TODO backup the existing data to a temp table?</span>
</span><span id="__span-7-9"><a id="__codelineno-7-9" name="__codelineno-7-9"></a><span>        </span><span>await</span><span> </span><span>db</span><span>.</span><span>pool</span><span>.</span><span>query</span><span>(</span><span>`</span>
</span><span id="__span-7-10"><a id="__codelineno-7-10" name="__codelineno-7-10"></a><span>            DELETE FROM message;`</span>
</span><span id="__span-7-11"><a id="__codelineno-7-11" name="__codelineno-7-11"></a><span>        </span><span>);</span>
</span><span id="__span-7-12"><a id="__codelineno-7-12" name="__codelineno-7-12"></a><span>        </span><span>await</span><span> </span><span>db</span><span>.</span><span>pool</span><span>.</span><span>query</span><span>(</span><span>`</span>
</span><span id="__span-7-13"><a id="__codelineno-7-13" name="__codelineno-7-13"></a><span>            INSERT INTO message (msg, time) </span>
</span><span id="__span-7-14"><a id="__codelineno-7-14" name="__codelineno-7-14"></a><span>            VALUES ('msg a', '2009-01-01:00:00:00'),</span>
</span><span id="__span-7-15"><a id="__codelineno-7-15" name="__codelineno-7-15"></a><span>                   ('msg b', '2009-01-02:00:00:00')</span>
</span><span id="__span-7-16"><a id="__codelineno-7-16" name="__codelineno-7-16"></a><span>        `</span><span>);</span>
</span><span id="__span-7-17"><a id="__codelineno-7-17" name="__codelineno-7-17"></a><span>    </span><span>}</span><span> </span><span>catch</span><span> </span><span>(</span><span>error</span><span>)</span><span> </span><span>{</span>
</span><span id="__span-7-18"><a id="__codelineno-7-18" name="__codelineno-7-18"></a><span>        </span><span>console</span><span>.</span><span>error</span><span>(</span><span>"setup failed. "</span><span> </span><span>+</span><span> </span><span>error</span><span>);</span>
</span><span id="__span-7-19"><a id="__codelineno-7-19" name="__codelineno-7-19"></a><span>        </span><span>throw</span><span> </span><span>error</span><span>;</span>
</span><span id="__span-7-20"><a id="__codelineno-7-20" name="__codelineno-7-20"></a><span>    </span><span>}</span>
</span><span id="__span-7-21"><a id="__codelineno-7-21" name="__codelineno-7-21"></a><span>}</span>
</span><span id="__span-7-22"><a id="__codelineno-7-22" name="__codelineno-7-22"></a>
</span><span id="__span-7-23"><a id="__codelineno-7-23" name="__codelineno-7-23"></a><span>async</span><span> </span><span>function</span><span> </span><span>teardown</span><span>()</span><span> </span><span>{</span>
</span><span id="__span-7-24"><a id="__codelineno-7-24" name="__codelineno-7-24"></a><span>    </span><span>// TODO restore the table from the backup;</span>
</span><span id="__span-7-25"><a id="__codelineno-7-25" name="__codelineno-7-25"></a><span>    </span><span>try</span><span> </span><span>{</span>
</span><span id="__span-7-26"><a id="__codelineno-7-26" name="__codelineno-7-26"></a><span>        </span><span>await</span><span> </span><span>db</span><span>.</span><span>pool</span><span>.</span><span>query</span><span>(</span><span>`</span>
</span><span id="__span-7-27"><a id="__codelineno-7-27" name="__codelineno-7-27"></a><span>            DELETE FROM message;`</span>
</span><span id="__span-7-28"><a id="__codelineno-7-28" name="__codelineno-7-28"></a><span>        </span><span>);</span>
</span><span id="__span-7-29"><a id="__codelineno-7-29" name="__codelineno-7-29"></a><span>        </span><span>await</span><span> </span><span>db</span><span>.</span><span>cleanup</span><span>();</span>
</span><span id="__span-7-30"><a id="__codelineno-7-30" name="__codelineno-7-30"></a><span>    </span><span>}</span><span> </span><span>catch</span><span> </span><span>(</span><span>error</span><span>)</span><span> </span><span>{</span>
</span><span id="__span-7-31"><a id="__codelineno-7-31" name="__codelineno-7-31"></a><span>        </span><span>console</span><span>.</span><span>error</span><span>(</span><span>"teardown failed. "</span><span> </span><span>+</span><span> </span><span>error</span><span>);</span>
</span><span id="__span-7-32"><a id="__codelineno-7-32" name="__codelineno-7-32"></a><span>        </span><span>throw</span><span> </span><span>error</span><span>;</span>
</span><span id="__span-7-33"><a id="__codelineno-7-33" name="__codelineno-7-33"></a><span>    </span><span>}</span>
</span><span id="__span-7-34"><a id="__codelineno-7-34" name="__codelineno-7-34"></a><span>}</span>
</span><span id="__span-7-35"><a id="__codelineno-7-35" name="__codelineno-7-35"></a>
</span><span id="__span-7-36"><a id="__codelineno-7-36" name="__codelineno-7-36"></a><span>describe</span><span>(</span><span>"routes.echo endpoint integration tests"</span><span>,</span><span> </span><span>()</span><span> </span><span>=&gt;</span><span> </span><span>{</span>
</span><span id="__span-7-37"><a id="__codelineno-7-37" name="__codelineno-7-37"></a><span>    </span><span>beforeAll</span><span>(</span><span>async</span><span> </span><span>()</span><span> </span><span>=&gt;</span><span> </span><span>{</span>
</span><span id="__span-7-38"><a id="__codelineno-7-38" name="__codelineno-7-38"></a><span>        </span><span>await</span><span> </span><span>setup</span><span>();</span>
</span><span id="__span-7-39"><a id="__codelineno-7-39" name="__codelineno-7-39"></a><span>    </span><span>});</span>
</span><span id="__span-7-40"><a id="__codelineno-7-40" name="__codelineno-7-40"></a><span>    </span><span>test</span><span> </span><span>(</span><span>"testing /echo/all"</span><span>,</span><span> </span><span>async</span><span> </span><span>()</span><span> </span><span>=&gt;</span><span> </span><span>{</span>
</span><span id="__span-7-41"><a id="__codelineno-7-41" name="__codelineno-7-41"></a><span>        </span><span>const</span><span> </span><span>res</span><span> </span><span>=</span><span> </span><span>await</span><span> </span><span>request</span><span>(</span><span>app</span><span>).</span><span>get</span><span>(</span><span>'/echo/all'</span><span>);</span>
</span><span id="__span-7-42"><a id="__codelineno-7-42" name="__codelineno-7-42"></a><span>        </span><span>const</span><span> </span><span>expected</span><span> </span><span>=</span><span> </span><span>[</span><span> </span><span>new</span><span> </span><span>message</span><span>.</span><span>Message</span><span>(</span><span>'msg a'</span><span>,</span><span> </span><span>new</span><span> </span><span>Date</span><span>(</span><span>'2009-01-01:00:00:00'</span><span>)),</span><span> </span>
</span><span id="__span-7-43"><a id="__codelineno-7-43" name="__codelineno-7-43"></a><span>                           </span><span>new</span><span> </span><span>message</span><span>.</span><span>Message</span><span>(</span><span>'msg b'</span><span>,</span><span> </span><span>new</span><span> </span><span>Date</span><span>(</span><span>'2009-01-02:00:00:00'</span><span>))]</span>
</span><span id="__span-7-44"><a id="__codelineno-7-44" name="__codelineno-7-44"></a><span>        </span><span>expect</span><span>(</span><span>res</span><span>.</span><span>statusCode</span><span>).</span><span>toEqual</span><span>(</span><span>200</span><span>);</span>
</span><span id="__span-7-45"><a id="__codelineno-7-45" name="__codelineno-7-45"></a><span>        </span><span>const</span><span> </span><span>json</span><span> </span><span>=</span><span> </span><span>JSON</span><span>.</span><span>parse</span><span>(</span><span>res</span><span>.</span><span>text</span><span>);</span>
</span><span id="__span-7-46"><a id="__codelineno-7-46" name="__codelineno-7-46"></a><span>        </span><span>const</span><span> </span><span>received</span><span> </span><span>=</span><span> </span><span>[];</span>
</span><span id="__span-7-47"><a id="__codelineno-7-47" name="__codelineno-7-47"></a><span>        </span><span>for</span><span> </span><span>(</span><span>let</span><span> </span><span>i</span><span> </span><span>in</span><span> </span><span>json</span><span>)</span><span> </span><span>{</span>
</span><span id="__span-7-48"><a id="__codelineno-7-48" name="__codelineno-7-48"></a><span>            </span><span>received</span><span>.</span><span>push</span><span>(</span><span>new</span><span> </span><span>message</span><span>.</span><span>Message</span><span>(</span><span>json</span><span>[</span><span>i</span><span>].</span><span>msg</span><span>,</span><span> </span><span>new</span><span> </span><span>Date</span><span>(</span><span>json</span><span>[</span><span>i</span><span>].</span><span>time</span><span>)))</span>
</span><span id="__span-7-49"><a id="__codelineno-7-49" name="__codelineno-7-49"></a><span>        </span><span>}</span>
</span><span id="__span-7-50"><a id="__codelineno-7-50" name="__codelineno-7-50"></a><span>        </span><span>expect</span><span>(</span><span>received</span><span>.</span><span>sort</span><span>()).</span><span>toEqual</span><span>(</span><span>expected</span><span>.</span><span>sort</span><span>());</span>
</span><span id="__span-7-51"><a id="__codelineno-7-51" name="__codelineno-7-51"></a><span>    </span><span>});</span>
</span><span id="__span-7-52"><a id="__codelineno-7-52" name="__codelineno-7-52"></a><span>    </span><span>afterAll</span><span>(</span><span>async</span><span> </span><span>()</span><span> </span><span>=&gt;</span><span> </span><span>{</span>
</span><span id="__span-7-53"><a id="__codelineno-7-53" name="__codelineno-7-53"></a><span>        </span><span>await</span><span> </span><span>teardown</span><span>();</span>
</span><span id="__span-7-54"><a id="__codelineno-7-54" name="__codelineno-7-54"></a><span>    </span><span>});</span>
</span><span id="__span-7-55"><a id="__codelineno-7-55" name="__codelineno-7-55"></a>
</span><span id="__span-7-56"><a id="__codelineno-7-56" name="__codelineno-7-56"></a><span>})</span>
</span></code></pre></div></td></tr></tbody></table>

The setup and teardown routines are similar to the unit test for `message.all()`. The only difference is that in the test case, we initiate the call from the app level which trigger the router handler with URL path `/echo/all`. We then extract the returned text returned from the handler, and parse it back to a json object. Finally we compared the received results (created from `json`) and the expected result.

When we run

<table><tbody><tr><td></td><td><div><pre id="__code_8"><span></span><code><span id="__span-8-1"><a id="__codelineno-8-1" name="__codelineno-8-1"></a>npm<span> </span>run<span> </span><span>test</span><span> </span>echo.test.js
</span></code></pre></div></td></tr></tbody></table>

we see

<table><tbody><tr><td><div><pre><span></span><span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-1"> 1</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-2"> 2</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-3"> 3</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-4"> 4</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-5"> 5</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-6"> 6</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-7"> 7</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-8"> 8</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-9"> 9</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-10">10</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-11">11</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-12">12</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-13">13</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-14">14</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-15">15</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-16">16</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-17">17</a></span>
<span><a href="https://sutd50003.github.io/notes/l9_2_integrationtest/#__codelineno-9-18">18</a></span></pre></div></td><td><div><pre id="__code_9"><span></span><code><span id="__span-9-1"><a id="__codelineno-9-1" name="__codelineno-9-1"></a>&gt;<span> </span>my-mysql-app@0.0.0<span> </span><span>test</span>
</span><span id="__span-9-2"><a id="__codelineno-9-2" name="__codelineno-9-2"></a>&gt;<span> </span>jest<span> </span>--detectOpenHandles<span> </span>echo.test.js
</span><span id="__span-9-3"><a id="__codelineno-9-3" name="__codelineno-9-3"></a>
</span><span id="__span-9-4"><a id="__codelineno-9-4" name="__codelineno-9-4"></a><span>  </span>console.log
</span><span id="__span-9-5"><a id="__codelineno-9-5" name="__codelineno-9-5"></a><span>    </span><span>2</span>
</span><span id="__span-9-6"><a id="__codelineno-9-6" name="__codelineno-9-6"></a>
</span><span id="__span-9-7"><a id="__codelineno-9-7" name="__codelineno-9-7"></a><span>      </span>at<span> </span>Object.log<span> </span><span>(</span>models/message.js:36:17<span>)</span>
</span><span id="__span-9-8"><a id="__codelineno-9-8" name="__codelineno-9-8"></a>
</span><span id="__span-9-9"><a id="__codelineno-9-9" name="__codelineno-9-9"></a>GET<span> </span>/echo/all<span> </span><span>200</span><span> </span><span>28</span>.616<span> </span>ms<span> </span>-<span> </span><span>101</span>
</span><span id="__span-9-10"><a id="__codelineno-9-10" name="__codelineno-9-10"></a><span> </span>PASS<span>  </span>__test__/models/echo.test.js
</span><span id="__span-9-11"><a id="__codelineno-9-11" name="__codelineno-9-11"></a><span>  </span>routes.echo<span> </span>endpoint<span> </span>integration<span> </span>tests
</span><span id="__span-9-12"><a id="__codelineno-9-12" name="__codelineno-9-12"></a><span>    </span>✓<span> </span>testing<span> </span>/echo/all<span> </span><span>(</span><span>66</span><span> </span>ms<span>)</span>
</span><span id="__span-9-13"><a id="__codelineno-9-13" name="__codelineno-9-13"></a>
</span><span id="__span-9-14"><a id="__codelineno-9-14" name="__codelineno-9-14"></a>Test<span> </span>Suites:<span> </span><span>1</span><span> </span>passed,<span> </span><span>1</span><span> </span>total
</span><span id="__span-9-15"><a id="__codelineno-9-15" name="__codelineno-9-15"></a>Tests:<span>       </span><span>1</span><span> </span>passed,<span> </span><span>1</span><span> </span>total
</span><span id="__span-9-16"><a id="__codelineno-9-16" name="__codelineno-9-16"></a>Snapshots:<span>   </span><span>0</span><span> </span>total
</span><span id="__span-9-17"><a id="__codelineno-9-17" name="__codelineno-9-17"></a>Time:<span>        </span><span>0</span>.678<span> </span>s,<span> </span>estimated<span> </span><span>1</span><span> </span>s
</span><span id="__span-9-18"><a id="__codelineno-9-18" name="__codelineno-9-18"></a>Ran<span> </span>all<span> </span><span>test</span><span> </span>suites<span> </span>matching<span> </span>/echo.test.js/i.
</span></code></pre></div></td></tr></tbody></table>

#### Cyclic call-graph[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#cyclic-call-graph "Permanent link")

In case that the call-graph contains cycles, i.e. due to mutual recursion, we have to test the strong connected components as a unit

#### Pairwise testing[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#pairwise-testing "Permanent link")

Besides top-down or bottom-up strategies, an alternative is to perform pair-wise testing. The idea is to test each edge of the call-graph. Similar to bottom-up strategy, we could convert unit tests for invidiual unit into test drivers for every pair, saving some effort in mock-up effort. One advantage of pairwise testing is to higher degree of fault isolation.

## System Testing[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#system-testing "Permanent link")

System testing is often less formal compared to unit testing and integration test. Test cases of the system testing can be derived from

-   The use case documents and use case diagrams
-   The sequence diagrams
-   The state machine diagrams

For instance given the following use case document

We can define a system test case as follows

## Life-cycle based testing[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#life-cycle-based-testing "Permanent link")

In this section, we discuss how to incoporate the testing activities along with the software development life-cycle.

### Waterfall testing[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#waterfall-testing "Permanent link")

In Walterfall software life-cycle, we could easily incoprate the testing activities as the last few phases.

As highlighted in the earlier lesson, Waterfall testing as part of the waterfall development life-cycle, suffers from the long feedback interval issues.

### Iterative Life Cycle testing[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#iterative-life-cycle-testing "Permanent link")

In Iterative Software Dvelopment Life Cycle, we break and stage different parts/levels of the system components to be developed in different iterations.

In terms of testing, we follow a similar structure of waterfall testing for each iteration, except that towards the end, we conduct regression testing and progression testing instead of system test.

-   Regression testing - to re-test the test cases defined and passed in the previous iterations.
-   Progress testing - to pre-test the test cases defined in the upcoming iterations, some of them should fail.

### Agile Testing[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#agile-testing "Permanent link")

Recall in Agile development, the development plans are engineered to focus

-   Customer-driven
-   Bottom–up development
-   Flexibility with respect to changing requirements
-   Early delivery of fully functional components

Agile Development is often divided into sprints. In each sprints, development team liaise with the project users to identify the deliverables that should be delivered in the particular sprint. In the testing aspect, the testing must be aligned with the user story development for each sprint.

## Futher Reading[¶](https://sutd50003.github.io/notes/l9_2_integrationtest/#futher-reading "Permanent link")

1.  `https://lambtsa.medium.com/rest-api-with-express-router-jest-and-supertest-10832a23016f`
2.  `https://medium.com/geekculture/testing-express-js-with-jest-8c6855945f03`
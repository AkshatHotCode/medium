import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { jwt, sign, verify } from 'hono/jwt'
import { bodyLimit } from 'hono/body-limit'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
}>()


//Middleware, get the header, verify it, if verified proceed to the next code, if not throw 403
app.use('/api/v1/blog/*', async (c, next) => {
  const header = c.req.header("authorization") || "";

  const response = await verify(header, c.env.JWT_SECRET)
  if (response.id) {
    next()
  } else {
    c.status(403)
    return c.json({error: "unauthorized"})
  }
})

app.post('/api/v1/signup', async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try{
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name
      }
    })

    const token = await sign({id: user.id}, c.env.JWT_SECRET);

    return c.json({
      jwt: token
    });
  } catch(e) {
    c.status(403);
    return c.json({error:"error while signing up"});;
  }
})

app.post('/api/v1/signin', async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password
      }
    })
    if (!user) {
      c.status(403);
      return c.json({
        message: "Incorrect creds"
      })
    }
    const jwt = await sign({
      id: user.id
    }, c.env.JWT_SECRET);
    return c.json({
      jwt: jwt
    })
  }catch(e) {
    c.status(411);
    return c.json({error:"Invalid"})
  }
})

app.post('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})

app.put('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/v1/blog/:id', (c) => {
  return c.text('Hello Hono!')
})

app.get('api/v1/blog/bulk', (c) => {
  return c.text("Hello hono!")
})


export default app